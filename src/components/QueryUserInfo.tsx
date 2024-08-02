import { BitBadgesApi } from '@/global/api';
import { useAccount, useAccountsContext } from '@/global/contexts/AccountsContext';
import { useCollection, useCollectionsContext } from '@/global/contexts/CollectionsContext';
import { BitBadgesCollection, UintRange } from 'bitbadgesjs-sdk';
import { useEffect, useMemo, useState } from 'react';
import { AddressDisplay } from './address/AddressDisplay';
import { AddressSelect } from './address/AddressSelect';
import { DevMode } from './DevMode';
import { BalanceDisplay } from './display/BalanceDisplay';
import { DisplayCard } from './display/DisplayCard';
import { CollectionMetadataDisplay } from './display/MetadataDisplay';
import { useDevModeContext } from '@/global/contexts/DevModeContext';

export const UserQueryInfo = () => {
  const { setAccounts } = useAccountsContext();
  const { setCollections } = useCollectionsContext();
  const { devMode } = useDevModeContext();

  const [selectedAddress, setSelectedAddress] = useState('4ZssFcjJkZHFChMdkUj6oyX853EUTrrK4wRPKLVbEnWP');
  const [collectionId, setCollectionId] = useState(1n);
  const [preferredDarkMode, setPreferredDarkMode] = useState<boolean | undefined>(undefined);

  const selectedAccount = useAccount(selectedAddress);
  const selectedCollection = useCollection(collectionId);

  const selectedBalances = useMemo(() => {
    return selectedAccount?.collected.find((collected) => collected.collectionId === collectionId)?.balances ?? [];
  }, [selectedAccount, collectionId]);

  useEffect(() => {
    BitBadgesApi.getAccounts({ accountsToFetch: [{ address: '4ZssFcjJkZHFChMdkUj6oyX853EUTrrK4wRPKLVbEnWP' }] }).then(
      (res) => {
        setAccounts(res.accounts);
      }
    );
  }, []);

  useEffect(() => {
    if (!selectedAccount) return;

    BitBadgesApi.getMaps({ mapIds: ['Dark Mode Protocol'] }).then((res) => {
      const map = res.maps[0];
      const value = map.values?.[selectedAccount.cosmosAddress]?.value;
      setPreferredDarkMode(value === undefined ? undefined : value === 'true');
    });
  }, [selectedAccount]);

  useEffect(() => {
    if (!selectedAccount) return;
    if (!collectionId) return;

    //Fetch balance for a specific collection, if not already fetched prior
    selectedAccount.fetchBadgeBalances(BitBadgesApi, collectionId);
  }, [selectedAccount, collectionId]);

  useEffect(() => {
    if (!collectionId) return;
    BitBadgesCollection.FetchAndInitialize(BitBadgesApi, {
      collectionId: collectionId,
      metadataToFetch: { badgeIds: [new UintRange({ start: 1n, end: 10n })] }
    }).then((collection) => {
      setCollections([collection]);
    });
  }, [collectionId]);

  return (
    <>
      <AddressSelect onSelect={(address) => setSelectedAddress(address)} />
      <br />
      <div className="flex-center">
        <AddressDisplay addressOrUsername={selectedAddress} />
      </div>
      <br />
      {selectedAddress && (
        <>
          <div className="flex-center flex-wrap" style={{ alignItems: 'normal' }}>
            <DisplayCard md={12} xs={24} sm={24} title="Balances" subtitle="">
              <>
                <div className="text-center mt-4">
                  {(BigInt(selectedAccount?.balance?.amount ?? 0) / BigInt(1e9)).toString()} $BADGE
                </div>
                <br />
                <div className="flex-center">
                  BitBadges Collection{' '}
                  <input
                    className={
                      'bg-gray-200 dark:bg-gray-800 p-3 mx-3 text-md' +
                      ' border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white'
                    }
                    style={{ width: '100px' }}
                    type="number"
                    value={Number(collectionId)}
                    onChange={(e) => setCollectionId(BigInt(e.target.value))}
                  />
                </div>

                {selectedCollection && <CollectionMetadataDisplay collectionId={collectionId} />}
                <div className="flex-center mt-3">
                  <BalanceDisplay balances={selectedBalances} />
                </div>
                <DevMode obj={selectedBalances} toShow={devMode} />
              </>
            </DisplayCard>
            <DisplayCard md={12} xs={24} sm={24} title="Protocols" subtitle="">
              <div className="mt-4 text-center">
                Prefers Dark Mode: {preferredDarkMode ? '✅' : preferredDarkMode === undefined ? 'Unset' : '❌'}
              </div>
            </DisplayCard>
          </div>
        </>
      )}
    </>
  );
};
