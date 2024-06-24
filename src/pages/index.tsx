import { BitBadgesApi } from '@/chains/api';
import { useAccount, useAccountsContext } from '@/chains/chain_contexts/AccountsContext';
import { useCollection, useCollectionsContext } from '@/chains/chain_contexts/CollectionsContext';
import { DevMode } from '@/components/DevMode';
import { AddressDisplay } from '@/components/address/AddressDisplay';
import { BalanceDisplay } from '@/components/display/BalanceDisplay';
import { DisplayCard } from '@/components/display/DisplayCard';
import { MetadataDisplay } from '@/components/display/MetadataDisplay';
import { ClaimHelpers } from '@/components/distribute.tsx';
import { VerifySecrets } from '@/components/secrets/secrets';
import { SelfHostBalances } from '@/components/selfHostBalances';
import { SiwbbDisplay } from '@/components/siwbb/siwbb';
import { notification } from 'antd';
import { BitBadgesCollection, BitBadgesUserInfo, NumberType, UintRange } from 'bitbadgesjs-sdk';
import { AssetConditionGroup } from 'blockin';
import { useRouter } from 'next/router';
import { NextPage } from 'next/types';
import { ReactNode, useEffect, useMemo, useState } from 'react';
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
  const router = useRouter();

  const [currTab, setCurrTab] = useState('Sign In with BitBadges');
  const [devMode, setDevMode] = useState(false);

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
          aria-current="page"
        >
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
          subtitle="Authentication is for authenticating users directly in your application. For BitBadges API authorization, see the API Authorization section below."
        >
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
            sm={24}
          >
            <div className="text-center">{vitalikAccount?.balance?.amount.toString()} $BADGE</div>
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
      label: 'Claim Distribution',
      node: (
        <>
          <DisplayCard
            title={'Claim Distribution'}
            md={24}
            xs={24}
            sm={24}
            subtitle="Distribute important claim details to users. If the criteria is met, you can redirect them
      to the claim link on the BitBadges site."
          >
            <ClaimHelpers />
          </DisplayCard>
        </>
      )
    },
    {
      label: 'Claim Auto-Completion',
      node: (
        <>
          <DisplayCard
            title={'Claim Auto-Completion'}
            md={24}
            xs={24}
            sm={24}
            subtitle="Complete claims for your users either automatically or when they do something on your site. This can be used to distribute badges or other assets."
          >
            <div className="flex-center">
              <button
                className="landing-button m-2"
                style={{ width: 200 }}
                onClick={async () => {
                  notification.info({
                    message: 'Auto-Claim',
                    description: 'See the /autoclaim endpoint'
                  });
                }}
              >
                Auto-Claim
              </button>
            </div>
          </DisplayCard>
        </>
      )
    },
    {
      label: 'Host Off-Chain Balances',
      node: (
        <>
          {' '}
          <DisplayCard
            title={`Host Off-Chain Balances`}
            md={24}
            xs={24}
            sm={24}
            subtitle="Self-host the balances for your collection via your backend. The URL is set in the core collection details on-chain and is used to fetch the balances."
          >
            <SelfHostBalances devMode={devMode} />
          </DisplayCard>
        </>
      )
    },
    {
      label: 'Secrets',
      node: (
        <>
          {' '}
          <DisplayCard
            title={`Secrets`}
            subtitle={
              'BitBadges offers a verifiable secrets feature to allow users to prove sensitive information to a verifier. These can be created and stored via BitBadges and accessed through the SIWBB flow, or you can provide a custom implementation (they are just message signatures).'
            }
            md={24}
            xs={24}
            sm={24}
          >
            <VerifySecrets devMode={devMode} />
          </DisplayCard>
        </>
      )
    },
    {
      label: 'Custom Plugins',
      node: (
        <>
          <DisplayCard
            title={`Custom Plugins`}
            subtitle={`To create a custom plugin, you need to setup a frontend (if needed) and a backend plugin handler. `}
            md={24}
            xs={24}
            sm={24}
          >
            <div className="flex-center">
              <button
                className="landing-button m-2"
                style={{ width: 200 }}
                onClick={async () => {
                  router.push('/plugin-frontend');
                }}
              >
                Frontend Example
              </button>{' '}
              <button
                className="landing-button m-2"
                style={{ width: 200 }}
                onClick={async () => {
                  notification.info({
                    message: 'Backend Example',
                    description: 'See the /plugin-backend endpoint'
                  });
                }}
              >
                Backend Example
              </button>
              <button
                className="landing-button m-2"
                style={{ width: 200 }}
                onClick={async () => {
                  window.open('https://bitbadges.io/developer', '_blank');
                }}
              >
                Developer Portal
              </button>
            </div>
          </DisplayCard>
        </>
      )
    },
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
    <button
      className="landing-button m-2"
      style={{ width: 200 }}
      onClick={async () => {
        const res = await getPrivateInfo();
        alert(res.message);
      }}
    >
      Get Private User Info
    </button>
  );
};

export default Home;
