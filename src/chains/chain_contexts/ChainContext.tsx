import { fetchAccountsWithOptions } from '@/redux/accounts/AccountsContext';
import { SupportedChain, convertToCosmosAddress } from 'bitbadgesjs-utils';
import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { INFINITE_LOOP_MODE } from '../../../constants';
import { useBitcoinContext } from './insite/BitcoinContext';
import { useCosmosContext } from './insite/CosmosContext';
import { useEthereumContext } from './insite/EthereumContext';
import { useSolanaContext } from './insite/SolanaContext';
import { useSiwbbContext } from './siwbb/SIWBBContext';
import { useWeb2Context } from './web2/Web2Context';
import { checkSignIn, signOut } from '../backend_connectors';
import { TransactionPayload, TxContext } from 'bitbadgesjs-proto';
import { BaseDefaultChainContext } from '../utils';

export type SignChallengeResponse = {
  signature: string
  message: string;
}

export type ChainContextType = ChainSpecificContextType & {
  chain: SupportedChain,
  setChain: Dispatch<SetStateAction<SupportedChain>>,

  cosmosAddress: string,
}

export type ChainSpecificContextType = {
  address: string,

  loggedIn: boolean,
  setLoggedIn: Dispatch<SetStateAction<boolean>>,


  //Chain Specific
  connected: boolean,
  setConnected: Dispatch<SetStateAction<boolean>>,

  //These are assumed to remain constant, but included because they are chain-specific
  disconnect: () => Promise<any>,
  connect: () => Promise<any>,
  signChallenge: (challenge: string) => Promise<SignChallengeResponse>,
  signTxn: (context: TxContext, payload: TransactionPayload, simulate: boolean) => Promise<string>, //Returns broadcast post body
  getPublicKey: (cosmosAddress: string) => Promise<string>,
}




const ChainContext = createContext<ChainContextType>({
  ...BaseDefaultChainContext,
});

type Props = {
  children?: React.ReactNode
};

export const ChainContextProvider: React.FC<Props> = ({ children }) => {
  const [chain, setChain] = useState<SupportedChain>(SupportedChain.ETH);
  const [cookies, setCookies] = useCookies(['latestChain']);


  const ethereumContext = useEthereumContext();
  const cosmosContext = useCosmosContext();
  const solanaContext = useSolanaContext();
  const bitcoinContext = useBitcoinContext();
  const siwbbContext = useSiwbbContext();
  const web2Context = useWeb2Context();

  //Handle setting chain by default based on last signed in cookie
  useEffect(() => {
    if (cookies.latestChain !== chain) {
      setChain(cookies.latestChain);
    }
  }, [cookies.latestChain, chain]);

  useEffect(() => {
    checkSignIn().then((res) => {
      const { signedIn, username, address, chain, publicKey, siwbb } = res;

      if (signedIn) {
        //We have signed in with Web2 if username is returned
        //We have signed in with SIWBB if siwbb is returned
        //We have signed in with normal Web3 if neither is returned
        if (username) {
          web2Context.setUsername(username);
          web2Context.setPublicKey(publicKey);
          web2Context.setActive(true);
          web2Context.setAddress(address);
        } else if (siwbb) {
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

  useEffect(() => {
    if (INFINITE_LOOP_MODE) console.log('useEffect: chainContext');

    if (cookies.latestChain !== chain) {
      setCookies('latestChain', chain);
    }
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

  const chainContext: ChainContextType = web2Context.active || siwbbContext.active ?
    {
      ...(web2Context.active ? web2Context : siwbbContext),
      cosmosAddress: convertToCosmosAddress(siwbbContext.address),
      setChain: () => { },
    } : {
      ...currentChainContext,
      cosmosAddress: convertToCosmosAddress(currentChainContext.address),
      chain,
      setChain,
    };

  //Fetch account info on address change
  useEffect(() => {
    fetchAccountsWithOptions([{ address: chainContext.address, fetchBalance: true, fetchSequence: true }]);
  }, [chainContext.address]);

  return <ChainContext.Provider value={chainContext}>
    {children}
  </ChainContext.Provider>;
}


export const useChainContext = () => useContext(ChainContext);

