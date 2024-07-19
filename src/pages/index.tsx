import { BitBadgesApi } from '@/chains/api';
import { useAccount, useAccountsContext } from '@/chains/chain_contexts/AccountsContext';
import { useCollection, useCollectionsContext } from '@/chains/chain_contexts/CollectionsContext';
import { DevMode } from '@/components/DevMode';
import { AddressDisplay } from '@/components/address/AddressDisplay';
import { BalanceDisplay } from '@/components/display/BalanceDisplay';
import { DisplayCard } from '@/components/display/DisplayCard';
import { MetadataDisplay } from '@/components/display/MetadataDisplay';
import { ClaimHelpers } from '@/components/distribute.tsx';
import { SelfHostBalances } from '@/components/selfHostBalances';
import { SiwbbDisplay } from '@/components/siwbb/siwbb';
import { notification } from 'antd';
import {
  BitBadgesCollection,
  BitBadgesUserInfo,
  GetSearchSuccessResponse,
  NumberType,
  UintRange
} from 'bitbadgesjs-sdk';
import { AssetConditionGroup } from 'blockin';
import { NextPage } from 'next/types';
import { ButtonHTMLAttributes, ReactNode, useEffect, useMemo, useState } from 'react';
import { getPrivateInfo } from '../chains/backend_connectors';
import Header from '../components/Header';
import { BroadcastTxPopupButton } from '../components/transactions';

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

const Home: NextPage = () => {
  //Chain Contexts
  const [currTab, setCurrTab] = useState('Sign In with BitBadges');
  const [devMode, setDevMode] = useState(true);

  //Global State Contexts
  const { setCollections } = useCollectionsContext();
  const { setAccounts } = useAccountsContext();

  //Use hooks for specific accounts and collections
  const vitalikAccount = useAccount('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
  const exampleCollection = useCollection(1n);
  const firstEthTxCollection = useCollection(16n);

  const vitalikBalances = useMemo(() => {
    return vitalikAccount?.collected.find((collected) => collected.collectionId === 16n)?.balances ?? [];
  }, [vitalikAccount]);

  const [preferredDarkMode, setPreferredDarkMode] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchResult, setSearchResult] = useState<GetSearchSuccessResponse<bigint>>();

  useEffect(() => {
    async function fetch() {
      //Fetch collections. Alternative is to use FetchAndInitializeBatch
      const collection = await BitBadgesCollection.FetchAndInitialize(BitBadgesApi, {
        collectionId: 1n,
        metadataToFetch: { badgeIds: [new UintRange({ start: 1n, end: 1n })] }
      });
      const firstEthTxCollection = await BitBadgesCollection.FetchAndInitialize(BitBadgesApi, {
        collectionId: 16n
      });
      setCollections([collection, firstEthTxCollection]);

      //Metadata isn't automatically fetched by default (and we didn't specify above). It can be fetched in a paginated manner like this
      await firstEthTxCollection.fetchMetadata(BitBadgesApi, {
        metadataToFetch: { badgeIds: [new UintRange({ start: 1n, end: 1n })] }
      });

      //Fetch accounts
      const vitalikAccount = await BitBadgesUserInfo.FetchAndInitialize(BitBadgesApi, {
        address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        fetchBalance: true,
        fetchSequence: true,
        viewsToFetch: []
      });

      //Fetch first page of collected badges
      await vitalikAccount.fetchNextForView(BitBadgesApi, 'badgesCollected', 'badgesCollected');

      //Fetch balance for a specific collection, if not already fetched prior
      await vitalikAccount.fetchBadgeBalances(BitBadgesApi, 16n);

      setAccounts([vitalikAccount]);

      await BitBadgesApi.getMaps({ mapIds: ['Dark Mode Protocol'] }).then((res) => {
        const map = res.maps[0];
        setPreferredDarkMode(!!map.values?.[vitalikAccount.cosmosAddress]);
      });
    }
    fetch();
  }, []);

  const ownershipRequirements: AssetConditionGroup<NumberType> = {
    // Must NOT own the scammer badge to get access
    assets: [
      {
        chain: 'BitBadges',
        collectionId: 1,
        assetIds: [{ start: 9, end: 9 }],
        mustOwnAmounts: { start: 0, end: 0 },
        ownershipTimes: []
      }
    ]
  };

  const Tab = ({ label, onClick, active } = { label: '', onClick: () => {}, active: '' }) => {
    return (
      <li>
        <a
          onClick={onClick}
          className={` ${
            active
              ? 'active inline-flex items-center px-4 py-3 text-white bg-blue-700 rounded-lg  w-full dark:bg-blue-600'
              : 'inline-flex items-center px-4 py-3 text-gray-400 rounded-lg cursor-pointer bg-gray-50 w-full dark:bg-gray-800 dark:text-gray-500'
          }`}
          aria-current="page">
          {label}
        </a>
      </li>
    );
  };

  const navTabs: { label: string; node: ReactNode }[] = [
    {
      label: 'Sign In with BitBadges',
      node: (
        <DisplayCard
          title="Authentication"
          md={24}
          xs={24}
          sm={24}
          subtitle="Authentication is for authenticating users directly in your application. For BitBadges API authorization, see the API Authorization section below.">
          <br />

          <SiwbbDisplay ownershipRequirements={ownershipRequirements} />
          <br />
          <br />
          <div className="flex-center flex-wrap">
            <SecretInfoButton />
            <BroadcastTxPopupButton />
          </div>
        </DisplayCard>
      )
    },

    {
      label: 'BitBadges Claims',
      node: (
        <>
          <DisplayCard
            title={'BitBadges Claims'}
            md={24}
            xs={24}
            sm={24}
            subtitle="You have a few options for gating BitBadges claims">
            <div className="mt-4">
              <div className="primary-text font-bold font-xl">1. All In-Site</div>
              <div className="secondary-text">
                Most claims can be completely implemented on the BitBadges site with custom plugins and no extra code
                required. Users will claim on the claim page. If you want to gate claims with unsupported custom
                criteria, see the steps below. You could also consider creating your own custom plugin.
              </div>{' '}
              <div className="flex-center">
                <CoolButton
                  className="mt-4"
                  onClick={async () => {
                    window.open('https://bitbadges.io/claims/directory', '_blank');
                  }}>
                  Custom Plugins
                </CoolButton>
                <CoolButton
                  className="mt-4"
                  onClick={async () => {
                    window.open(
                      'https://docs.bitbadges.io/for-developers/claim-builder/plugins/creating-a-custom-plugin',
                      '_blank'
                    );
                  }}>
                  Create a Custom Plugin
                </CoolButton>
              </div>
            </div>{' '}
            <div className="mt-4">
              <div className="primary-text font-bold font-xl">2. Auto-Claiming</div>
              <div className="secondary-text">
                Setup the claim and auto-claim on behalf of users. This can be done through the BitBadges API or through
                Zapier. The claim creation process will walk you through this.
              </div>
            </div>
            <div className="flex-center">
              <CoolButton
                className="m-2"
                onClick={async () => {
                  notification.info({
                    message: 'Auto-Claim',
                    description: 'See the /autoclaim endpoint'
                  });
                }}>
                Auto-Claim
              </CoolButton>
              <CoolButton
                className="m-2"
                onClick={async () => {
                  window.open('https://zapier.com/apps/bitbadges', '_blank');
                }}>
                Zapier
              </CoolButton>
            </div>
            <div className="mt-4">
              <div className="primary-text font-bold font-xl">3. In-Site + Custom Criteria</div>
              <div className="secondary-text">
                Setup the claim only with in-site plugins on the BitBadges site. For implementing custom criteria,
                consdier using generic ones like codes, passwords, or emails. You then gate such information to users
                how you would like using a custom implementation (e.g. payments, private database checks, etc). Claiming
                will be done by users on the BitBadges site by providing the required information.
              </div>
            </div>
            <ClaimHelpers />
          </DisplayCard>
        </>
      )
    },

    {
      label: 'Self-Host Balances',
      node: (
        <>
          {' '}
          <DisplayCard
            title={`Host Off-Chain Balances`}
            md={24}
            xs={24}
            sm={24}
            subtitle="Self-host the balances for your collection via your backend. The URL is set in the core collection details on-chain and is used to fetch the balances. You have complete control over the responses.">
            <SelfHostBalances devMode={devMode} />
          </DisplayCard>
        </>
      )
    },
    {
      label: 'Fetch Balances',
      node: (
        <>
          {' '}
          <DisplayCard
            title={
              <div className="flex-center">
                <AddressDisplay addressOrUsername={vitalikAccount?.address ?? ''} fontSize={24} />
              </div>
            }
            md={24}
            xs={24}
            sm={24}>
            <div className="text-center">
              {(BigInt(vitalikAccount?.balance?.amount ?? 0) / BigInt(1e9)).toString()} $BADGE
            </div>
            {firstEthTxCollection && <MetadataDisplay collectionId={16n} />}
            <br />
            <div className="flex-center">Collection {16} Balances</div>
            <div className="flex-center">
              <BalanceDisplay balances={vitalikBalances} />
            </div>
            <DevMode obj={vitalikBalances} toShow={devMode} />
          </DisplayCard>
        </>
      )
    },

    {
      label: 'Fetch Collections',
      node: (
        <>
          <DisplayCard title={`Collection ${exampleCollection?.collectionId}`} md={24} xs={24} sm={24}>
            {exampleCollection && <MetadataDisplay collectionId={1n} />}
            <DevMode obj={exampleCollection?.getCollectionMetadata()} toShow={devMode} />
          </DisplayCard>
        </>
      )
    },
    {
      label: 'Search Users',
      node: (
        <>
          <DisplayCard
            title={`Search Users`}
            subtitle={
              'Search addresses or usernames to find BitBadges users. Note that name resolution is only BitBadges usernames, not other services like ENS, etc. Those have to be implemented on your own.'
            }
            md={24}
            xs={24}
            sm={24}>
            <div className="flex-center flex-column">
              <input
                className="input dark my-2 rounded-md p-2 inherit-width  bg-gray-200 dark:bg-gray-800 color:black dark:text-white"
                placeholder="Search for a user"
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <CoolButton
                className="my-2"
                onClick={async () => {
                  const res = await BitBadgesApi.getSearchResults(searchInput);
                  setSearchResult(res);
                  setAccounts(res.accounts);
                  console.log(res);
                }}>
                Search Users
              </CoolButton>
              <br />
              <div className="flex-center flex-column">
                {searchResult?.accounts.map((account) => (
                  <AddressDisplay key={account.address} addressOrUsername={account.address} />
                ))}
              </div>
            </div>
          </DisplayCard>
        </>
      )
    },
    {
      label: 'Fetch Map / Protocol Information',
      node: (
        <>
          <DisplayCard
            title={`Protocol Information`}
            subtitle={`Fetch information from a map or protocol. This example fetches the Dark Mode Protocol map.`}
            md={24}
            xs={24}
            sm={24}>
            <div className="flex-center mt-2">
              <AddressDisplay addressOrUsername={vitalikAccount?.address ?? ''} />
            </div>

            <div className="mt-4 font-bold text-center">
              {preferredDarkMode ? 'Prefers Dark Mode' : 'Prefers Light Mode'}✅
            </div>
          </DisplayCard>
        </>
      )
    }
  ];

  return (
    <>
      <Header setDevMode={setDevMode} devMode={devMode} />

      <div>
        <div className="px-8">
          <div className="md:flex">
            <ul className="flex-column space-y space-y-4 text-sm font-medium text-gray-500 dark:text-gray-400 md:me-4 mb-4 md:mb-0">
              {navTabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  onClick={() => {
                    setCurrTab(tab.label);
                  }}
                  active={currTab === tab.label ? 'active' : ''}
                />
              ))}
            </ul>
            <div className="text-medium text-gray-500 dark:text-gray-400 w-full">
              {navTabs.find((tab) => tab.label === currTab)?.node}
            </div>
          </div>
        </div>
        <div className="flex-center flex-wrap px-8" style={{ alignItems: 'normal' }}></div>
        <div className="flex-center flex-wrap px-8" style={{ alignItems: 'normal' }}></div>
      </div>
    </>
  );
};

const SecretInfoButton = () => {
  return (
    <CoolButton
      className=" m-2"
      onClick={async () => {
        try {
          const res = await getPrivateInfo();
          alert(res.message);
        } catch (e) {
          alert('Error fetching private user info: not authenticated');
        }
      }}>
      Get Private User Info
    </CoolButton>
  );
};

export const CoolButton = ({
  children,
  ...props
}: { children: React.ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={`cool-button group group-hover:from-pink-600 group-hover:to-blue-500 ${props?.className}`}>
      <span className="cool-button-inner group flex-center">{children}</span>
    </button>
  );
};

export default Home;
