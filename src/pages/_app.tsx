import '../styles/globals.css';
import '../styles/index.css';
import '../styles/antd-override-styles.css';

import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { ChainContextProvider as BlockinChainContextProvider } from '../global/contexts/ChainContext';

import { AccountsProvider } from '@/global/contexts/AccountsContext';
import { CollectionsProvider } from '@/global/contexts/CollectionsContext';
import { BitcoinContextProvider } from '@/global/contexts/chains/BitcoinContext';
import { CosmosContextProvider } from '@/global/contexts/chains/CosmosContext';
import { EthereumContextProvider } from '@/global/contexts/chains/EthereumContext';
import { SolanaContextProvider } from '@/global/contexts/chains/SolanaContext';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import getConfig from 'next/config';
import type {} from 'redux-thunk/extend-redux';
import { WagmiProvider } from 'wagmi';
import { defaultWagmiConfig } from '@web3modal/wagmi';
import { mainnet } from 'viem/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DevModeProvider } from '@/global/contexts/DevModeContext';
import { WalletModeProvider } from '@/global/contexts/WalletModeContext';

const { publicRuntimeConfig } = getConfig();

require('dotenv').config();

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

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
      <QueryClientProvider client={queryClient}>
        <AccountsProvider>
          <CollectionsProvider>
            <DevModeProvider>
              <WalletModeProvider>
                <BitcoinContextProvider>
                  <CosmosContextProvider>
                    <EthereumContextProvider>
                      <SolanaContextProvider>
                        <BlockinChainContextProvider>
                          <div className="">
                            <div className="layout gradient-bg" style={{ minHeight: '100vh' }}>
                              <Component {...pageProps} />
                              <div style={{ minHeight: 100 }}></div>
                            </div>
                          </div>
                        </BlockinChainContextProvider>
                      </SolanaContextProvider>
                    </EthereumContextProvider>
                  </CosmosContextProvider>
                </BitcoinContextProvider>
              </WalletModeProvider>
            </DevModeProvider>
          </CollectionsProvider>
        </AccountsProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
