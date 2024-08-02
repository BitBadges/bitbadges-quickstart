import {
  BitBadgesUserInfo,
  Fee,
  getChainForAddress,
  MAINNET_CHAIN_DETAILS,
  SupportedChain,
  TransactionPayload,
  TxContext
} from 'bitbadgesjs-sdk';
import { Dispatch, SetStateAction } from 'react';

export const BaseDefaultChainContext: ChainContextType = {
  address: '',
  loggedInAddress: '',
  connected: false,
  loggedIn: false,
  cosmosAddress: '',
  setLoggedInAddress: () => {},
  connect: async () => {},
  autoConnect: async () => {},
  disconnect: async () => {},
  signMessage: async () => {
    return { message: '', signature: '' };
  },
  signBitBadgesTxn: async () => {
    return '';
  },
  getPublicKey: async () => {
    return '';
  },
  chain: SupportedChain.UNKNOWN,
  setChain: () => {}
};

export type SignMessageResponse = {
  signature: string;
  message: string;
  publicKey?: string;
};

export type ChainContextType = ChainSpecificContextType & {
  chain: SupportedChain;
  setChain: Dispatch<SetStateAction<SupportedChain>>;

  cosmosAddress: string;

  loggedIn: boolean;
  connected: boolean;
  loggedInAddress: string;

  setLoggedInAddress: Dispatch<SetStateAction<string>>;
};

export type ChainSpecificContextType = {
  address: string;

  //These are assumed to remain constant, but included because they are chain-specific
  disconnect: () => Promise<any>;
  autoConnect: () => Promise<any>;
  connect: () => Promise<any>;
  signMessage: (message: string) => Promise<SignMessageResponse>;
  signBitBadgesTxn: (context: TxContext, payload: TransactionPayload, simulate: boolean) => Promise<string>;
  getPublicKey: () => Promise<string>;
};

export const getBitBadgesTxContextFromAccount = (account: BitBadgesUserInfo<bigint>, fee: Fee) => {
  const txContext: TxContext = {
    chain: {
      ...MAINNET_CHAIN_DETAILS,
      chain: getChainForAddress(account?.address ?? '')
    },
    sender: {
      accountAddress: account?.cosmosAddress ?? '',
      sequence: Number(account?.sequence ?? '0') >= 0 ? Number(account?.sequence ?? '0') : 0,
      accountNumber: Number(account?.accountNumber ?? '0'),
      pubkey: account?.publicKey ?? ''
    },
    fee: fee,
    memo: ''
  };

  return txContext;
};
