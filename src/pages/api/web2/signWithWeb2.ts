import { Secp256k1 } from '@cosmjs/crypto';
import { BigIntify } from 'bitbadgesjs-sdk';
import { constructChallengeObjectFromString, createChallenge } from 'blockin';
import { TypedDataField, Wallet, utils } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { DBAccountType } from './types';
import { db } from './db';

const signWithWeb2 = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const username = req.body.username;
    const message = req.body.message;
    const eipToSign = req.body.eipToSign;
    let password = req.body.password;

    //Can either manually pass in the password or use the session cookie
    if (!password) {
      const sessionDetails = JSON.parse(req.cookies.session || '{}');
      password = sessionDetails.password;
    }

    // First, authenticate the user with Web2 ad get their mapped address and mnemonic
    const details: DBAccountType = await db.get(username);
    if (!details || details.password !== password) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const mappedAddress = details.address;
    const mappedMnemonic = details.mnemonic;

    //If the message is a blockin message, we need to sign it as a personal message signature
    //Else, we sign it as a BitBadges transaction
    let isBlockinMessage = false;
    let signature = '';
    try {
      constructChallengeObjectFromString(message, BigIntify);
      isBlockinMessage = true;
    } catch (err) {}

    let messageToSign = message;
    let publicKey = '';
    if (isBlockinMessage) {
      //We didn't yet specify the address, so we need to do that now with the mapped one
      //Then, sign the message with the mapped mnemonic
      const wallet = Wallet.fromMnemonic(mappedMnemonic);
      messageToSign = createChallenge({
        ...constructChallengeObjectFromString(message, BigIntify),
        address: mappedAddress
      });
      signature = await wallet.signMessage(messageToSign);

      //If signing a transaction, we will eventually need the public key
      //This snippet gets the base64 public key from the signature
      //https://docs.bitbadges.io/for-developers/create-and-broadcast-txs/transaction-context
      const msgHash = utils.hashMessage(messageToSign);
      const msgHashBytes = utils.arrayify(msgHash);
      const pubKey = utils.recoverPublicKey(msgHashBytes, signature);

      const pubKeyHex = pubKey.substring(2);
      const compressedPublicKey = Secp256k1.compressPubkey(new Uint8Array(Buffer.from(pubKeyHex, 'hex')));
      const base64PubKey = Buffer.from(compressedPublicKey).toString('base64');
      publicKey = base64PubKey;

      await db.set(username, { ...details, publicKey: base64PubKey });
    } else {
      //Little messy, but if we are signing a BitBadges transaction, we need to sign it as a typed message
      //The normal ethers acts weird with the EIP712Domain type, so we need to filter it out to work
      //https://docs.bitbadges.io/for-developers/create-and-broadcast-txs/signing-ethereum
      const types_ = (Object.entries(eipToSign.types) as any)
        .filter(([key]: any) => key !== 'EIP712Domain')
        .reduce(
          (types: any, [key, attributes]: [string, TypedDataField[]]) => {
            types[key] = attributes.filter((attr) => attr.type !== 'EIP712Domain');
            return types;
          },
          {} as Record<string, TypedDataField[]>
        );

      signature = await Wallet.fromMnemonic(mappedMnemonic)._signTypedData(eipToSign.domain, types_, eipToSign.message);
    }

    //TODO: You can return stuff whatever you want in your frontend. You should keep mnemonic private though
    return res.status(200).json({
      signature,
      message: messageToSign,
      address: mappedAddress,
      publicKey
    });
  } catch (err) {
    console.log('error', err);
    console.log(err);
    return res.status(401).json({ message: `${err}` });
  }
};

export default signWithWeb2;
