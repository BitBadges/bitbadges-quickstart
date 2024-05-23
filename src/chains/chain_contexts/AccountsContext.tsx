import { BitBadgesUserInfo, convertToCosmosAddress } from 'bitbadgesjs-sdk';
import React, { ReactNode, createContext, useContext, useState } from 'react';

// Define the context type
type AccountsContextType = {
  accounts: { [cosmosAddress: string]: BitBadgesUserInfo<bigint> };
  setAccounts: (accounts: BitBadgesUserInfo<bigint>[]) => void;
};

// Create a new context
const AccountsContext = createContext<AccountsContextType | undefined>(undefined);

// Create a provider component
export const AccountsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<{ [cosmosAddress: string]: BitBadgesUserInfo<bigint> }>({});

  const setAccountsInStore = (accountsToAdd: BitBadgesUserInfo<bigint>[]) => {
    const newAccounts = { ...accounts };
    for (const account of accountsToAdd) {
      newAccounts[account.cosmosAddress] = account;
    }

    setAccounts((accounts) => ({ ...accounts, ...newAccounts }));
  };

  return (
    <AccountsContext.Provider value={{ accounts, setAccounts: setAccountsInStore }}>
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccountsContext = () => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccountsData must be used within a AccountsProvider');
  }

  return context;
};

// Custom hook to use the Accounts data and update function
export const useAccount = (address: string): BitBadgesUserInfo<bigint> | undefined => {
  const context = useContext(AccountsContext);
  if (!context) {
    throw new Error('useAccountsData must be used within a AccountsProvider');
  }

  const cosmosAddress = convertToCosmosAddress(address);
  if (!context.accounts[cosmosAddress]) {
    return undefined;
  }

  return context.accounts[cosmosAddress];
};
