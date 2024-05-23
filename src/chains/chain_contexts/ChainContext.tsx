import {
  BitBadgesUserInfo,
  SupportedChain,
  TransactionPayload,
  TxContext,
  convertToCosmosAddress
} from 'bitbadgesjs-sdk';
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { BitBadgesApi } from '../api';
import { checkSignIn, signOut } from '../backend_connectors';
import { BaseDefaultChainContext } from '../utils';
import { useAccountsContext } from './AccountsContext';
import { useBitcoinContext } from './insite/BitcoinContext';
import { useCosmosContext } from './insite/CosmosContext';
import { useEthereumContext } from './insite/EthereumContext';
import { useSolanaContext } from './insite/SolanaContext';
import { useSiwbbContext } from './siwbb/SIWBBContext';

export type SignChallengeResponse = {
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

  setLoggedInAddress: Dispatch<SetStateAction<string>>;
};

export type ChainSpecificContextType = {
  address: string;

  //These are assumed to remain constant, but included because they are chain-specific
  disconnect: () => Promise<any>;
  connect: () => Promise<any>;
  signChallenge: (challenge: string) => Promise<SignChallengeResponse>;
  signTxn: (context: TxContext, payload: TransactionPayload, simulate: boolean) => Promise<string>; //Returns broadcast post body
  getPublicKey: () => Promise<string>;
};

const ChainContext = createContext<ChainContextType>({
  ...BaseDefaultChainContext
});

type Props = {
  children?: React.ReactNode;
};

export const ChainContextProvider: React.FC<Props> = ({ children }) => {
  const [chain, setChain] = useState<SupportedChain>(SupportedChain.ETH);
  const [cookies, setCookies] = useCookies(['latestChain']);
  const [loggedInAddress, setLoggedInAddress] = useState<string>('');

  const { setAccounts } = useAccountsContext();

  const ethereumContext = useEthereumContext();
  const cosmosContext = useCosmosContext();
  const solanaContext = useSolanaContext();
  const bitcoinContext = useBitcoinContext();
  const siwbbContext = useSiwbbContext();

  //Handle setting chain by default based on last signed in cookie
  useEffect(() => {
    setChain(cookies.latestChain);
  }, []);

  useEffect(() => {
    if (cookies.latestChain !== chain) {
      setCookies('latestChain', chain);
    }
  }, [chain]);

  useEffect(() => {
    checkSignIn().then((res) => {
      const { signedIn, address, chain, siwbb } = res;

      if (signedIn) {
        setLoggedInAddress(address);
        //We have signed in with SIWBB if siwbb is returned
        //We have signed in with normal Web3 if neither is returned
        if (siwbb) {
          siwbbContext.setActive(true);
          siwbbContext.setAddress(address);
          siwbbContext.setChain(chain);
        } else {
        }
      } else {
        signOut();
      }
    });
  }, []);

  let currentChainContext: ChainSpecificContextType;
  if (chain?.startsWith('Cosmos')) {
    currentChainContext = cosmosContext;
  } else if (chain?.startsWith('Solana')) {
    currentChainContext = solanaContext;
  } else if (chain?.startsWith('Bitcoin')) {
    currentChainContext = bitcoinContext;
  } else {
    currentChainContext = ethereumContext;
  }

  const chainContext: ChainContextType = {
    ...(siwbbContext.active ? siwbbContext : currentChainContext),
    chain,
    setChain,
    cosmosAddress: '',
    loggedIn: false,
    connected: false,
    setLoggedInAddress
  };
  chainContext.cosmosAddress = convertToCosmosAddress(chainContext.address);
  chainContext.connected = chainContext.address ? true : false;
  chainContext.loggedIn = !!(
    loggedInAddress &&
    chainContext.address &&
    convertToCosmosAddress(loggedInAddress) === convertToCosmosAddress(chainContext.address)
  );

  //Fetch account info on address change
  useEffect(() => {
    async function fetchAccountInfo() {
      if (!chainContext.address) return;
      const account = await BitBadgesUserInfo.FetchAndInitialize(BitBadgesApi, {
        address: chainContext.address,
        fetchBalance: true,
        fetchSequence: true
      });
      setAccounts([account]);
    }
    fetchAccountInfo();
  }, [chainContext.address]);

  return <ChainContext.Provider value={chainContext}>{children}</ChainContext.Provider>;
};

export const useChainContext = () => useContext(ChainContext);
