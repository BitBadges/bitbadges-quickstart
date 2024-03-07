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
import { Web2ContextProvider } from '@/chains/chain_contexts/web2/Web2Context';
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react';
import getConfig from 'next/config';
import type {} from 'redux-thunk/extend-redux';
import { WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
const { publicRuntimeConfig } = getConfig();

// 2. Create wagmiConfig
const metadata = {
  name: 'BitBadges',
  description: 'BitBadges Quickstar',
  url: 'http://localhost:3000',
  icons: ['https://avatars.githubusercontent.com/u/86890740']
};

const chains = [mainnet];
const projectId = publicRuntimeConfig.WC_PROJECT_ID;
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains });

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
    <WagmiConfig config={wagmiConfig}>
      <AccountsProvider>
        <CollectionsProvider>
          <BitcoinContextProvider>
            <CosmosContextProvider>
              <EthereumContextProvider>
                <SolanaContextProvider>
                  <SiwbbContextProvider>
                    <Web2ContextProvider>
                      <BlockinChainContextProvider>
                        <div className="">
                          <div className="layout gradient-bg" style={{ minHeight: '100vh' }}>
                            <Component {...pageProps} />
                            <div style={{ minHeight: 100 }}></div>
                          </div>
                        </div>
                      </BlockinChainContextProvider>
                    </Web2ContextProvider>
                  </SiwbbContextProvider>
                </SolanaContextProvider>
              </EthereumContextProvider>
            </CosmosContextProvider>
          </BitcoinContextProvider>
        </CollectionsProvider>
      </AccountsProvider>
    </WagmiConfig>
  );
};

export default App;
