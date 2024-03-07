import { createContext, useContext, useState } from 'react';
//react cooki
import { BaseDefaultChainContext } from '@/chains/utils';
import { SupportedChain } from 'bitbadgesjs-sdk';
import { signOut } from '../../backend_connectors';
import { ChainSpecificContextType } from '../ChainContext';

export type SignChallengeResponse = {
  message: string;
  signature: string;
};

export type SiwbbContextType = ChainSpecificContextType & {
  chain: SupportedChain;
  setChain: (chain: SupportedChain) => void;

  setAddress: (address: string) => void;

  active: boolean;
  setActive: (active: boolean) => void;
};

const SiwbbContext = createContext<SiwbbContextType>({
  ...BaseDefaultChainContext,
  active: false,
  setActive: () => {},
  chain: SupportedChain.UNKNOWN,
  setChain: () => {},
  setAddress: () => {}
});

type Props = {
  children?: React.ReactNode;
};

export const SiwbbContextProvider: React.FC<Props> = ({ children }) => {
  const [active, setActive] = useState<boolean>(false);
  const [chain, setChain] = useState<SupportedChain>(SupportedChain.UNKNOWN);
  const [address, setAddress] = useState<string>('');

  const disconnect = async () => {
    await signOut();
    setActive(false);
  };

  const siwbbContext: SiwbbContextType = {
    //Dummy values for interface compatibility
    connect: async () => {
      throw new Error('Not implemented. N/A to SIWBB.');
    },
    signChallenge: async () => {
      throw new Error('Not implemented. N/A to SIWBB.');
    },
    getPublicKey: async () => {
      throw new Error('Not implemented. N/A to SIWBB.');
    },
    signTxn: async () => {
      throw new Error('Not implemented. N/A to SIWBB.');
      // N/A
      // If necessary, you can outsource to the broadcast popup
      // Can't be done in-site with SIWBB since all connection was handled on bitbadges.io
    },
    chain,
    address,
    disconnect,
    active,
    setActive,
    setChain,
    setAddress
  };

  return <SiwbbContext.Provider value={siwbbContext}>{children}</SiwbbContext.Provider>;
};

export const useSiwbbContext = () => useContext(SiwbbContext);
