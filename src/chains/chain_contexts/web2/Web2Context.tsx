import { SupportedChain } from 'bitbadgesjs-sdk';
import { createContext, useContext, useState } from 'react';
import { signOut, signWithWeb2 } from '../../backend_connectors';
import { ChainSpecificContextType } from '../ChainContext';

import { useAccount } from '@/redux/accounts/AccountsContext';
import { TransactionPayload, TxContext, createTxBroadcastBodyEthereum } from 'bitbadgesjs-sdk';
import { BaseDefaultChainContext } from '@/chains/utils';

export type SignChallengeResponse = {
  message: string;
  signature: string
}

export type Web2ContextType = ChainSpecificContextType & {
  chain: SupportedChain,
  active: boolean,
  setActive: (active: boolean) => void,

  username: string,
  setUsername: (username: string) => void,

  publicKey: string,
  setPublicKey: (publicKey: string) => void,

  signChallenge: (message: string, username?: string, password?: string) => Promise<SignChallengeResponse>,

  setAddress: (address: string) => void,
}

const Web2Context = createContext<Web2ContextType>({
  ...BaseDefaultChainContext,
  setAddress: () => { },
  active: false,
  setActive: () => { },
  username: '',
  setUsername: () => { },
  chain: SupportedChain.UNKNOWN,
  publicKey: '',
  setPublicKey: () => { },
});

type Props = {
  children?: React.ReactNode
};

export const Web2ContextProvider: React.FC<Props> = ({ children }) => {
  const [active, setActive] = useState<boolean>(false);
  const [publicKey, setPublicKey] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const loggedIn = true;
  const chain = SupportedChain.ETH
  const account = useAccount(address);

  const disconnect = async () => {
    await signOut();
    setActive(false);
  }

  const getPublicKey = async () => {
    return publicKey;
  }

  const web2Context: Web2ContextType = {
    connect: async () => { },
    //Signs a challenge using the mapped address via the backend
    signChallenge: async (origMessage: string, username?: string, password?: string) => {
      const res = await signWithWeb2(username ?? '', password ?? '', origMessage, undefined);
      if (!res.signature) throw new Error("No signature returned from backend. " + res.message);

      const { signature, address, publicKey, message } = res; //Must use the new message bc it is manipulated
      setPublicKey(publicKey);
      setAddress(address);

      return { message, signature };
    },
    getPublicKey,
    publicKey,
    setPublicKey,
    username,
    setUsername,
    active,
    setActive,
    signTxn: async (context: TxContext, payload: TransactionPayload, simulate: boolean) => {
      if (!account) throw new Error("Account not found.")
      let sig = ""
      if (!simulate) {
        //Don't need password here bc it will be stored in cookies already (unlike signChallenge where the cookie is not set yet)
        const res = await signWithWeb2(username, '', '', payload.eipToSign);
        sig = res.signature;
      }

      const txBody = createTxBroadcastBodyEthereum(context, payload, sig);
      return txBody
    },
    connected: true,
    setConnected: () => { },
    setLoggedIn: () => { },
    chain,
    loggedIn,
    address,
    disconnect,
    setAddress,
  };

  return <Web2Context.Provider value={web2Context}>
    {children}
  </Web2Context.Provider>;
}


export const useWeb2Context = () => useContext(Web2Context);

