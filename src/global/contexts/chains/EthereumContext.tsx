import { Secp256k1 } from '@cosmjs/crypto';
import { useWeb3Modal } from '@web3modal/wagmi/react';

import { BaseDefaultChainContext } from '../utils';
import { notification } from 'antd';
import { TransactionPayload, TxContext, convertToCosmosAddress, createTxBroadcastBody } from 'bitbadgesjs-sdk';
import { SigningKey, getBytes, hashMessage } from 'ethers';
import { createContext, useContext, useEffect, useState } from 'react';
import { useDisconnect, useSignMessage, useAccount as useWeb3Account } from 'wagmi';
import { useAccount, useAccountsContext } from '../AccountsContext';
import { ChainSpecificContextType } from '../utils';

export type EthereumContextType = ChainSpecificContextType & {};

export const EthereumContext = createContext<EthereumContextType>({
  ...BaseDefaultChainContext
});

type Props = {
  children?: React.ReactNode;
};

export const EthereumContextProvider: React.FC<Props> = ({ children }) => {
  const { open } = useWeb3Modal();
  const { setAccounts } = useAccountsContext();
  const web3AccountContext = useWeb3Account();
  const [address, setAddress] = useState<string>('');
  const cosmosAddress = convertToCosmosAddress(address);
  const account = useAccount(cosmosAddress);
  const { signMessageAsync } = useSignMessage();

  useEffect(() => {
    setAddress(web3AccountContext.address || '');
  }, [web3AccountContext]);

  const { disconnect: disconnectWeb3 } = useDisconnect();

  const autoConnect = async () => {};

  const connect = async () => {
    if (!address) {
      try {
        await open();
      } catch (e) {
        notification.error({
          message: 'Error connecting to wallet',
          description:
            'Make sure you have a compatible Ethereum wallet installed (such as MetaMask) and that you are signed in to it.'
        });
      }
    }
  };

  const disconnect = async () => {
    await disconnectWeb3();
  };

  const signMessage = async (message: string) => {
    if (!account) throw new Error('Account not found.');

    const sign = await signMessageAsync({
      message: message
    });

    const msgHash = hashMessage(message);
    const msgHashBytes = getBytes(msgHash);
    const pubKey = SigningKey.recoverPublicKey(msgHashBytes, sign);

    const pubKeyHex = pubKey.substring(2);
    const compressedPublicKey = Secp256k1.compressPubkey(new Uint8Array(Buffer.from(pubKeyHex, 'hex')));
    const base64PubKey = Buffer.from(compressedPublicKey).toString('base64');

    account.publicKey = base64PubKey;
    setAccounts([account]);

    return {
      message,
      signature: sign
    };
  };

  const signBitBadgesTxn = async (context: TxContext, payload: TransactionPayload, simulate: boolean) => {
    if (!account) throw new Error('Account not found.');
    //If we are within  ~1000 chars limit, we can have user sign the typed EIP712
    //Else, we hash the JSON and have user sign the hash

    const normalMessage = false;
    let sig = '';
    if (normalMessage) {
      if (!simulate) {
        // sig = await signTypedData({
        //   message: payload.eipToSign.message as any,
        //   types: payload.eipToSign.types as any,
        //   domain: payload.eipToSign.domain,
        //   primaryType: payload.eipToSign.primaryType
        // });
      }
    } else {
      if (!simulate) {
        const message = payload.humanReadableMessage;
        sig = await signMessageAsync({
          message: message
        });
      }
    }

    const txBody = createTxBroadcastBody(context, payload, sig);
    return txBody;
  };

  const getPublicKey = async () => {
    try {
      const currAccount = account?.clone();
      if (currAccount && currAccount.publicKey) {
        return currAccount.publicKey;
      }

      if (!currAccount) {
        throw new Error('Account not found.');
      }

      const message =
        "Hello! We noticed that you haven't interacted the BitBadges blockchain yet. To interact with the BitBadges blockchain, we need your PUBLIC key for your address to allow us to generate transactions.\n\nPlease kindly sign this message to allow us to compute your public key.\n\nThis message is not a blockchain transaction and signing this message has no purpose other than to compute your public key.\n\nThanks for your understanding!";

      const sig = await signMessageAsync({ message });

      const msgHash = hashMessage(message);
      const msgHashBytes = getBytes(msgHash);
      const pubKey = SigningKey.recoverPublicKey(msgHashBytes, sig);

      const pubKeyHex = pubKey.substring(2);
      const compressedPublicKey = Secp256k1.compressPubkey(new Uint8Array(Buffer.from(pubKeyHex, 'hex')));
      const base64PubKey = Buffer.from(compressedPublicKey).toString('base64');
      currAccount.publicKey = base64PubKey;
      setAccounts([currAccount]);

      return base64PubKey;
    } catch (e) {
      console.log(e);
      return '';
    }
  };

  const ethereumContext: EthereumContextType = {
    connect,
    disconnect,
    autoConnect,
    signMessage,
    signBitBadgesTxn,
    address,
    getPublicKey
  };

  return <EthereumContext.Provider value={ethereumContext}>{children}</EthereumContext.Provider>;
};

export const useEthereumContext = () => useContext(EthereumContext);