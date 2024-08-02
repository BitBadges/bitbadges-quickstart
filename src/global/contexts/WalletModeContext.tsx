import React, { ReactNode, createContext, useContext, useState } from 'react';

// Define the context type
type WalletModeContextType = {
  walletMode: boolean;
  setWalletMode: (walletMode: boolean) => void;
};

// Create a new context
const WalletModeContext = createContext<WalletModeContextType | undefined>(undefined);

// Create a provider component
export const WalletModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletMode, setWalletMode] = useState(true);

  return <WalletModeContext.Provider value={{ walletMode, setWalletMode }}>{children}</WalletModeContext.Provider>;
};

export const useWalletModeContext = () => {
  const context = useContext(WalletModeContext);
  if (!context) {
    throw new Error('useWalletModeContext must be used within a WalletModeProvider');
  }
  return context;
};
