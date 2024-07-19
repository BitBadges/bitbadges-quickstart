import '../styles/globals.css';
import '../styles/index.css';
import '../styles/antd-override-styles.css';

import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { ChainContextProvider as BlockinChainContextProvider } from '../chains/chain_contexts/ChainContext';
import { SiwbbContextProvider } from '../chains/chain_contexts/siwbb/SIWBBContext';

import { AccountsProvider } from '@/chains/chain_contexts/AccountsContext';
import { CollectionsProvider } from '@/chains/chain_contexts/CollectionsContext';
import { BitcoinContextProvider } from '@/chains/chain_contexts/insite/BitcoinContext';
import { CosmosContextProvider } from '@/chains/chain_contexts/insite/CosmosContext';
import { EthereumContextProvider } from '@/chains/chain_contexts/insite/EthereumContext';
import { SolanaContextProvider } from '@/chains/chain_contexts/insite/SolanaContext';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import getConfig from 'next/config';
import type {} from 'redux-thunk/extend-redux';
import { WagmiProvider } from 'wagmi';
import { defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { publicRuntimeConfig } = getConfig();

require('dotenv').config();

process.env.BBS_SIGNATURES_MODE = 'WASM';

const queryClient = new QueryClient();

// 2. Create wagmiConfig
const metadata = {
  name: 'BitBadges',
  description: 'BitBadges Quickstarter',
  url: 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/86890740']
};

const chains = [mainnet] as const;
const projectId = publicRuntimeConfig.WC_PROJECT_ID;
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata
});
// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId });

const App = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    // Check if dark mode is enabled in local storage
    const isDarkMode = !localStorage.getItem('darkMode') || localStorage.getItem('darkMode') === 'true';

    // Apply dark mode styles if it's enabled
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      {' '}
      <QueryClientProvider client={queryClient}>
        <AccountsProvider>
          <CollectionsProvider>
            <BitcoinContextProvider>
              <CosmosContextProvider>
                <EthereumContextProvider>
                  <SolanaContextProvider>
                    <SiwbbContextProvider>
                      <BlockinChainContextProvider>
                        <div className="">
                          <div className="layout gradient-bg" style={{ minHeight: '100vh' }}>
                            <Component {...pageProps} />
                            <div style={{ minHeight: 100 }}></div>
                          </div>
                        </div>
                      </BlockinChainContextProvider>
                    </SiwbbContextProvider>
                  </SolanaContextProvider>
                </EthereumContextProvider>
              </CosmosContextProvider>
            </BitcoinContextProvider>
          </CollectionsProvider>
        </AccountsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
