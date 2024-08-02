import React, { ReactNode, createContext, useContext, useState } from 'react';

// Define the context type
type DevModeContextType = {
  devMode: boolean;
  setDevMode: (devMode: boolean) => void;
};

// Create a new context
const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

// Create a provider component
export const DevModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [devMode, setDevMode] = useState(false);

  return <DevModeContext.Provider value={{ devMode, setDevMode }}>{children}</DevModeContext.Provider>;
};

export const useDevModeContext = () => {
  const context = useContext(DevModeContext);
  if (!context) {
    throw new Error('useDevModeContext must be used within a DevModeProvider');
  }
  return context;
};
