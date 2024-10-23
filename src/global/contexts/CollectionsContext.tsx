import { BitBadgesCollection, NumberType } from 'bitbadgesjs-sdk';
import React, { ReactNode, createContext, useContext, useState } from 'react';

// Define the context type
type CollectionsContextType = {
  collections: { [collectionId: string]: BitBadgesCollection<bigint> };
  setCollections: (collections: BitBadgesCollection<bigint>[]) => void;
};

// Create a new context
const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

// Create a provider component
export const CollectionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [collections, setCollections] = useState<{
    [bitbadgesAddress: string]: BitBadgesCollection<bigint>;
  }>({});

  const setCollectionsInStore = (collectionsToAdd: BitBadgesCollection<bigint>[]) => {
    const newCollections = { ...collections };
    for (const collection of collectionsToAdd) {
      newCollections[collection.collectionId.toString()] = collection;
    }

    setCollections(newCollections);
  };

  return (
    <CollectionsContext.Provider value={{ collections, setCollections: setCollectionsInStore }}>
      {children}
    </CollectionsContext.Provider>
  );
};

export const useCollectionsContext = () => {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollectionsData must be used within a CollectionsProvider');
  }

  return context;
};

// Custom hook to use the Collections data and update function
export const useCollection = (collectionId: NumberType): BitBadgesCollection<bigint> | undefined => {
  const context = useContext(CollectionsContext);
  if (!context) {
    throw new Error('useCollectionsData must be used within a CollectionsProvider');
  }

  if (!context.collections[collectionId.toString()]) {
    return undefined;
  }

  return context.collections[collectionId.toString()];
};
