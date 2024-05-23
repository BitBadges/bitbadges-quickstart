import { BitBadgesApi } from '@/chains/api';
import { useAccount, useAccountsContext } from '@/chains/chain_contexts/AccountsContext';
import { useCollection, useCollectionsContext } from '@/chains/chain_contexts/CollectionsContext';
import { useSiwbbContext } from '@/chains/chain_contexts/siwbb/SIWBBContext';
import { DevMode } from '@/components/DevMode';
import { AddressDisplay } from '@/components/address/AddressDisplay';
import { BalanceDisplay } from '@/components/display/BalanceDisplay';
import { DisplayCard } from '@/components/display/DisplayCard';
import { MetadataDisplay } from '@/components/display/MetadataDisplay';
import { Tabs } from '@/components/display/Tabs';
import { ClaimHelpers } from '@/components/distribute.tsx';
import { BlockinDisplay } from '@/components/insite/BlockinDisplay';
import { ManualDisplay } from '@/components/manual/manual';
import { VerifySecrets } from '@/components/secrets/secrets';
import { SelfHostBalances } from '@/components/selfHostBalances';
import { SiwbbDisplay } from '@/components/siwbb/siwbb';
import { BitBadgesCollection, BitBadgesUserInfo, NumberType, UintRange } from 'bitbadgesjs-sdk';
import { ChallengeParams, VerifyChallengeOptions } from 'blockin';
import { NextPage } from 'next/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPrivateInfo, signInManual, signOut } from '../chains/backend_connectors';
import { useChainContext } from '../chains/chain_contexts/ChainContext';
import Header from '../components/Header';
import { BroadcastTxPopupButton, SignTxInSiteButton } from '../components/transactions';

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
  const chain = useChainContext();
  const siwbbContext = useSiwbbContext();

  const [devMode, setDevMode] = useState(false);

  //Global State Contexts
  const { setCollections } = useCollectionsContext();
  const { setAccounts } = useAccountsContext();

  //Use hooks for specific accounts and collections
  const vitalikAccount = useAccount('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
  const exampleCollection = useCollection(1n);
  const firstEthTxCollection = useCollection(16n);

  const [signInMethodTabSelected, setSignInMethodTab] = useState('web3');
  const signInMethodTab = signInMethodTabSelected;

  const [web3SignInTypeSelected, setWeb3SignInType] = useState('siwbb');
  const web3SignInType = chain.loggedIn ? (siwbbContext.active ? 'siwbb' : 'insite') : web3SignInTypeSelected; //Use the active one if logged in

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

  //TODO: Customize
  // Function to generate challengeParams. Refreshes every 60 seconds to refresh issuedAt / expirationDate
  const generateChallengeParams = useCallback(() => {
    return {
      domain: 'http://localhost:3000',
      statement: 'By signing in, you agree to the privacy policy and terms of service.',
      address: '', //overridden by allowAddressSelect
      uri: 'http://localhost:3000',
      nonce: '*',
      notBefore: undefined,
      issuedAt: new Date(Date.now()).toISOString(),
      expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
      resources: [],
      assetOwnershipRequirements: {
        assets: [
          {
            chain: 'BitBadges',
            collectionId: 1,
            assetIds: [{ start: 9, end: 9 }],
            mustOwnAmounts: { start: 0, end: 0 },
            ownershipTimes: []
          }
        ]
      }
    } as ChallengeParams<NumberType>;
  }, []);

  // Define state to hold the challengeParams
  const [challengeParams, setChallengeParams] = useState<ChallengeParams<NumberType>>();

  useEffect(() => {
    setChallengeParams(generateChallengeParams());
  }, []); // Empty dependency array ensures this effect runs only once

  // useEffect to update challengeParams every 60 seconds
  useEffect(() => {
    // Set up interval to update challengeParams every 60 seconds
    const interval = setInterval(() => {
      setChallengeParams(generateChallengeParams());
    }, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array ensures this effect runs only once

  const expectedChallengeParams: Partial<ChallengeParams<NumberType>> = useMemo(() => {
    const params: Partial<ChallengeParams<NumberType>> = { ...challengeParams };
    //We allow the user to select their address
    //delete bc if undefined this checks address === undefined
    delete params.address;
    return params;
  }, [challengeParams]);

  const verifyManually = async (message: string, signature: string, options: VerifyChallengeOptions, publicKey?: string) => {
    try {
      await signInManual(message, signature, options, publicKey);
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  }

  if (!challengeParams) return <></>;

  return (
    <>
      <Header setDevMode={setDevMode} devMode={devMode} />
      <div>
        <div className="px-8">
          <DisplayCard title="Authentication" md={24} xs={24} sm={24}>
            <br />
            <div className="flex-center">
              <Tabs
                tab={signInMethodTab}
                setTab={async (tab) => {
                  if (chain.loggedIn) await signOut();
                  setSignInMethodTab(tab);
                }}
                tabInfo={[
                  {
                    key: 'web3',
                    content: 'Web3',
                    disabled: chain.connected && chain.loggedIn
                  },
                  {
                    key: 'manual',
                    content: 'Manual',
                    disabled: chain.connected && chain.loggedIn
                  }
                ]}
              />
            </div>
            <br />
            {signInMethodTab == 'manual' && <ManualDisplay  verifyManually={verifyManually} />}
            {signInMethodTab == 'web3' && (
              <>
                <div className="flex-center">
                  <Tabs
                    type="underline"
                    tab={web3SignInType}
                    setTab={setWeb3SignInType}
                    tabInfo={[
                      {
                        key: 'siwbb',
                        content: 'Popup',
                        disabled: chain.connected && chain.loggedIn
                      },
                      {
                        key: 'insite',
                        content: 'In-Site',
                        disabled: chain.connected && chain.loggedIn
                      }
                    ]}
                  />
                </div>
              </>
            )}
            {signInMethodTab == 'web3' && web3SignInType == 'insite' && (
              <div className="flex-center flex-column">
                <BlockinDisplay
                  verifyManually={verifyManually}
                  challengeParams={challengeParams}
                  verifyOptions={{
                    issuedAtTimeWindowMs: 5 * 60 * 1000, //5 minute "redeem" window
                    expectedChallengeParams
                  }}
                />
              </div>
            )}
            {signInMethodTab == 'web3' && web3SignInType == 'siwbb' && (
              <SiwbbDisplay
                challengeParams={challengeParams}
                verifyOptions={{ issuedAtTimeWindowMs: 5 * 60 * 1000, expectedChallengeParams }}
              />
            )}
            <br />
            <br />
            <br />
            {signInMethodTab !== 'manual' && (
              <>
                <div className="flex-center flex-wrap">
                  <SecretInfoButton />
                  <SignTxInSiteButton signInMethodTab={signInMethodTab} web3SignInType={web3SignInType} />
                  <BroadcastTxPopupButton signInMethodTab={signInMethodTab} />
                </div>
              </>
            )}
          </DisplayCard>
        </div>
        <div className="flex-center flex-wrap px-8" style={{ alignItems: 'normal' }}>
          <DisplayCard
            title={
              <div className="flex-center">
                <AddressDisplay addressOrUsername={vitalikAccount?.address ?? ''} fontSize={24} />
              </div>
            }
            md={12}
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
          <DisplayCard title={`Collection ${exampleCollection?.collectionId}`} md={12} xs={24} sm={24}>
            {exampleCollection && <MetadataDisplay collectionId={1n} />}
            <DevMode obj={exampleCollection?.getCollectionMetadata()} toShow={devMode} />
          </DisplayCard>
        </div>
        <div className="flex-center flex-wrap px-8" style={{ alignItems: 'normal' }}>
          <DisplayCard
            title={'Claim Distribution'}
            md={12}
            xs={24}
            sm={24}
            subtitle="Check certain criteria or distribute important claim details to users. If the criteria is met, you can redirect them
            to the claim link on the BitBadges site."
          >
            <ClaimHelpers />
          </DisplayCard>
          <DisplayCard
            title={`Host Off-Chain Balances`}
            md={12}
            xs={24}
            sm={24}
            subtitle="Self-host the balances for your collection via your backend. The URL is set in the core collection details on-chain and is used to fetch the balances."
          >
            <SelfHostBalances devMode={devMode} />
          </DisplayCard>

          <DisplayCard
            title={`Secrets`}
            subtitle={
              'BitBadges offers a verifiable secrets feature to allow users to prove sensitive information to a verifier. These can be created and stored via BitBadges and accessed through the SIWBB flow, or you can provide a custom implementation (they are just message signatures).'
            }
            md={12}
            xs={24}
            sm={24}
          >
            <VerifySecrets devMode={devMode} />
          </DisplayCard>
        </div>
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
