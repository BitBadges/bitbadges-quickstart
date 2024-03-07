import { Wallet } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { DBAccountType } from './types';
import { db } from './db';

const createWeb2Account = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    //When creating a new account, we need to generate a new mnemonic and address for the user to be used behind the scenes
    const username = req.body.username;
    const password = req.body.password;

    const newWallet = Wallet.createRandom();
    const mnemonic = newWallet.mnemonic.phrase;
    const address = newWallet.address;

    //Check if the username already exists
    const details: DBAccountType = await db.get(username);
    if (details) {
      return res.status(401).json({ message: 'Username already exists' });
    }

    await db.set(username, { address, mnemonic, username, password, publicKey: '' });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.log('error', err);
    return res.status(401).json({ message: `${err}` });
  }
};

export default createWeb2Account;
