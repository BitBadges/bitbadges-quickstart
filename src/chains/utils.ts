import { SupportedChain } from 'bitbadgesjs-sdk';
import { ChainContextType } from './chain_contexts/ChainContext';

export const BaseDefaultChainContext: ChainContextType = {
  address: '',
  connected: false,
  loggedIn: false,
  cosmosAddress: '',
  setLoggedInAddress: () => {},
  connect: async () => {},
  disconnect: async () => {},
  signChallenge: async () => {
    return { message: '', signature: '' };
  },
  signTxn: async () => {
    return '';
  },
  getPublicKey: async () => {
    return '';
  },
  chain: SupportedChain.UNKNOWN,
  setChain: () => {}
};
