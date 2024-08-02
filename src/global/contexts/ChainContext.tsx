import { BitBadgesUserInfo, SupportedChain, convertToCosmosAddress, getChainForAddress } from 'bitbadgesjs-sdk';
import { createContext, useContext, useEffect, useState } from 'react';
import { BitBadgesApi } from '@/bitbadges-api';
import { checkSignIn, signOut } from '../backend_connectors';
import { BaseDefaultChainContext, ChainContextType, ChainSpecificContextType } from './utils';
import { useAccountsContext } from './AccountsContext';
import { useBitcoinContext } from './chains/BitcoinContext';
import { useCosmosContext } from './chains/CosmosContext';
import { useEthereumContext } from './chains/EthereumContext';
import { useSolanaContext } from './chains/SolanaContext';
import { useWalletModeContext } from './WalletModeContext';

type Props = {
  children?: React.ReactNode;
};

const ChainContext = createContext<ChainContextType>({
  ...BaseDefaultChainContext
});

export const ChainContextProvider: React.FC<Props> = ({ children }) => {
  const [chain, setChain] = useState<SupportedChain>(SupportedChain.ETH);
  const [loggedInAddress, setLoggedInAddress] = useState<string>('');

  const { setAccounts } = useAccountsContext();

  const ethereumContext = useEthereumContext();
  const cosmosContext = useCosmosContext();
  const solanaContext = useSolanaContext();
  const bitcoinContext = useBitcoinContext();

  const { walletMode } = useWalletModeContext();

  useEffect(() => {
    checkSignIn()
      .then((res) => {
        const { signedIn, address } = res;

        if (signedIn) {
          setLoggedInAddress(address);

          if (walletMode) {
            if (getChainForAddress(address) === SupportedChain.COSMOS) {
              setChain(SupportedChain.COSMOS);
              cosmosContext.autoConnect();
            } else if (getChainForAddress(address) === SupportedChain.SOLANA) {
              setChain(SupportedChain.SOLANA);
              solanaContext.autoConnect();
            } else if (getChainForAddress(address) === SupportedChain.BTC) {
              setChain(SupportedChain.BTC);
              bitcoinContext.autoConnect();
            } else {
              setChain(SupportedChain.ETH);
              ethereumContext.autoConnect();
            }
          }
        } else {
          signOut();
        }
      })
      .catch((e) => {
        console.error(e);
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

  let chainContext: ChainContextType = {
    ...currentChainContext,
    chain,
    setChain,
    cosmosAddress: convertToCosmosAddress(currentChainContext.address),
    loggedIn: !!loggedInAddress,
    loggedInAddress,
    connected: !!currentChainContext.address,
    setLoggedInAddress
  };

  if (!walletMode) {
    chainContext = {
      ...BaseDefaultChainContext,
      address: loggedInAddress,
      cosmosAddress: convertToCosmosAddress(loggedInAddress),
      loggedInAddress,
      connected: !!loggedInAddress,
      loggedIn: !!loggedInAddress,
      setLoggedInAddress
    };
  }

  //Fetch account info on address change
  useEffect(() => {
    async function fetchAccountInfo() {
      if (!chainContext.address && !chainContext.loggedInAddress) return;
      if (chainContext.address) {
        const account = await BitBadgesUserInfo.FetchAndInitialize(BitBadgesApi, {
          address: chainContext.address,
          fetchBalance: true,
          fetchSequence: true
        });

        setAccounts([account]);
      }

      if (chainContext.loggedInAddress && chainContext.loggedInAddress !== chainContext.address) {
        const account = await BitBadgesUserInfo.FetchAndInitialize(BitBadgesApi, {
          address: chainContext.loggedInAddress,
          fetchBalance: true,
          fetchSequence: true
        });

        setAccounts([account]);
      }
    }
    fetchAccountInfo();
  }, [chainContext.address, chainContext.loggedInAddress]);

  return <ChainContext.Provider value={chainContext}>{children}</ChainContext.Provider>;
};

export const useChainContext = () => useContext(ChainContext);
