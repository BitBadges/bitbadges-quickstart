import { getBalancesIndexed, setBalances, getBalancesNonIndexed } from '@/chains/backend_connectors';
import { convertToCosmosAddress, addBalances, Balance, GO_MAX_UINT_64 } from 'bitbadgesjs-sdk';
import { useState } from 'react';
import { DevMode } from './DevMode';
import { AddressDisplay } from './address/AddressDisplay';
import { Tabs } from './display/Tabs';
import { useAccount } from '@/chains/chain_contexts/AccountsContext';
import { CoolButton } from '@/pages';

export const SelfHostBalances = ({ devMode }: { devMode: boolean }) => {
  const [balancesAssignmentResult, setBalancesAssignmentResult] = useState('');
  const [nonIndexedBalancesAssignmentResult, setNonIndexedBalancesAssignmentResult] = useState('');
  const [balancesTab, setBalancesTab] = useState('indexed');
  const vitalikAccount = useAccount('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');

  return (
    <>
      <br />
      <div className="flex-center flex-column mb-8">
        <Tabs
          tab={balancesTab}
          setTab={setBalancesTab}
          tabInfo={[
            {
              key: 'indexed',
              content: 'Indexed',
              disabled: false
            },
            {
              key: 'non-indexed',
              content: 'Non-Indexed',
              disabled: false
            }
          ]}
        />
        <div className="mt-3 secondary-text text-center">
          {`The endpoint for indexed balances returns a map of all balances (address -> balances) for the collection. The endpoint for non-indexed balances returns the balances for a specific address. Read more about the pros and cons in the docs.`}
        </div>
      </div>
      {balancesTab === 'indexed' && (
        <>
          <div className="flex-center">
            <CoolButton
              onClick={async () => {
                const res = await getBalancesIndexed();
                setBalancesAssignmentResult(res.balances);
                alert(`Fetched balances: ${JSON.stringify(res.balances, null, 2)}`);
              }}
            >
              {'Fetch Balances'}
            </CoolButton>
            <CoolButton
              onClick={async () => {
                //TODO: Add your own logic checking
                //TODO: Update your self-hosted balances URL to include the new user balances
                const currBalances = await getBalancesIndexed();
                const currVitalikBalance =
                  currBalances.balances[convertToCosmosAddress(vitalikAccount?.address ?? '')] ?? [];

                const newBalances = addBalances(
                  [
                    new Balance({
                      amount: 1n,
                      badgeIds: [{ start: 1n, end: 1n }],
                      ownershipTimes: [{ start: 1n, end: GO_MAX_UINT_64 }]
                    })
                  ],
                  currVitalikBalance
                );
                const addressToUpdate = vitalikAccount?.address ?? '';
                await setBalances(addressToUpdate, newBalances);

                const res = await getBalancesIndexed();
                const fetchedBalance = res.balances[convertToCosmosAddress(addressToUpdate)];
                alert(`Updated balances for ${addressToUpdate} to ${JSON.stringify(fetchedBalance, null, 2)}`);
                setBalancesAssignmentResult(res.balances);

                //TODO: If your collection is indexed, you will need to refresh the cached values on the BitBadges API (note there are cooldowns though)
                // await BitBadgesApi.refreshMetadata(collectionId)
              }}
            >
              {'Check Something and Update Balances'}
            </CoolButton>
          </div>
          <DevMode obj={balancesAssignmentResult} toShow={devMode} />
        </>
      )}

      {balancesTab === 'non-indexed' && (
        <>
          <div className="flex-center flex-column text-center">
            <div>
              Fetching balances for <AddressDisplay addressOrUsername={vitalikAccount?.address ?? ''} fontSize={16} />
            </div>
            <CoolButton
              className="mt-8"
              onClick={async () => {
                const res = await getBalancesNonIndexed(vitalikAccount?.address ?? '');
                alert(`Fetched balances: ${JSON.stringify(res.balances, null, 2)}`);
                setNonIndexedBalancesAssignmentResult(res.balances);
              }}
            >
              {'Fetch Balances'}
            </CoolButton>
          </div>

          <DevMode obj={nonIndexedBalancesAssignmentResult} toShow={devMode} />
        </>
      )}
    </>
  );
};
