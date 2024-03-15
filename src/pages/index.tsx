import { BitBadgesApi } from '@/chains/api';
import { useAccount, useAccountsContext } from '@/chains/chain_contexts/AccountsContext';
import { useCollection, useCollectionsContext } from '@/chains/chain_contexts/CollectionsContext';
import { useSiwbbContext } from '@/chains/chain_contexts/siwbb/SIWBBContext';
import { useWeb2Context } from '@/chains/chain_contexts/web2/Web2Context';
import { AddressDisplay } from '@/components/address/AddressDisplay';
import { BalanceDisplay } from '@/components/display/BalanceDisplay';
import { DisplayCard } from '@/components/display/DisplayCard';
import { MetadataDisplay } from '@/components/display/MetadataDisplay';
import { Tabs } from '@/components/display/Tabs';
import { BlockinDisplay } from '@/components/insite/BlockinDisplay';
import { ManualDisplay } from '@/components/manual/manual';
import { SiwbbDisplay } from '@/components/siwbb/siwbb';
import { Web2Display } from '@/components/web2/web2';
import {
  Balance,
  BitBadgesCollection,
  BitBadgesUserInfo,
  GO_MAX_UINT_64,
  NumberType,
  UintRange,
  addBalances,
  convertToCosmosAddress
} from 'bitbadgesjs-sdk';
import { ChallengeParams, VerifyChallengeOptions } from 'blockin';
import { NextPage } from 'next/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getBalancesIndexed, getPrivateInfo, setBalances, signIn, signOut } from '../chains/backend_connectors';
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
  const web2Context = useWeb2Context();

  //Global State Contexts
  const { setCollections } = useCollectionsContext();
  const { setAccounts } = useAccountsContext();

  //Use hooks for specific accounts and collections
  const vitalikAccount = useAccount('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
  const exampleCollection = useCollection(1n);
  const firstEthTxCollection = useCollection(16n);

  const [signInMethodTabSelected, setSignInMethodTab] = useState('web3');
  const signInMethodTab = web2Context.active ? 'web2' : signInMethodTabSelected;

  const [web3SignInTypeSelected, setWeb3SignInType] = useState('siwbb');
  const web3SignInType = chain.loggedIn ? (siwbbContext.active ? 'siwbb' : 'insite') : web3SignInTypeSelected; //Use the active one if logged in

  const [passwordIsVisible, setPasswordIsVisible] = useState(false);

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
      setAccounts([vitalikAccount]);
      
      //Fetch first page of collected badges
      await vitalikAccount.fetchNextForView(BitBadgesApi, 'badgesCollected', 'badgesCollected');

      //Fetch balance for a specific collection, if not already fetched prior
      await vitalikAccount.fetchBadgeBalances(BitBadgesApi, 16n);
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

  const verifyOnBackend = async (
    message: string,
    signature: string,
    sessionDetails: {
      username?: string;
      password?: string;
      siwbb?: boolean;
    },
    verifyOptions?: VerifyChallengeOptions,
    publicKey?: string
  ) => {
    try {
      const backendChecksRes = await signIn(message, signature, sessionDetails, verifyOptions, publicKey);
      if (!backendChecksRes.success) throw new Error(backendChecksRes.errorMessage ?? 'Error');
    } catch (e: any) {
      console.log(e.errorMessage ?? e.message ?? e);
      alert(e.errorMessage ?? e.message ?? e);
      throw e;
    }
  };

  if (!challengeParams) return <></>;

  return (
    <>
      <Header />
      <div>
        <div className="px-20">
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
                    disabled: chain.connected && chain.loggedIn && web2Context.active
                  },
                  {
                    key: 'web2',
                    content: 'Web2',
                    disabled: chain.connected && chain.loggedIn && !web2Context.active
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
            {signInMethodTab == 'manual' && <ManualDisplay verifyOnBackend={verifyOnBackend} />}
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
            {signInMethodTab == 'web2' && (
              <Web2Display
                verifyOnBackend={verifyOnBackend}
                challengeParams={challengeParams}
                verifyOptions={{
                  issuedAtTimeWindowMs: 5 * 60 * 1000, //5 minute "redeem" window
                  expectedChallengeParams
                }}
              />
            )}
            {signInMethodTab == 'web3' && web3SignInType == 'insite' && (
              <div className="flex-center flex-column">
                <BlockinDisplay
                  verifyOnBackend={verifyOnBackend}
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
                verifyOnBackend={verifyOnBackend}
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
        <div className="flex-center flex-wrap px-20" style={{ alignItems: 'normal' }}>
          <DisplayCard
            title={
              <div className="flex-center">
                <AddressDisplay addressOrUsername={vitalikAccount?.address ?? ''} fontSize={24} />
              </div>
            }
            md={12}
            xs={24}
            sm={24}>
            <div className="text-center">{vitalikAccount?.balance?.amount.toString()} $BADGE</div>
            {firstEthTxCollection && <MetadataDisplay collectionId={16n} />}
            <br />
            <div className="flex-center">Collection {16} Balances</div>
            <div className="flex-center">
              <BalanceDisplay balances={vitalikBalances} />
            </div>
          </DisplayCard>
          <DisplayCard title={`Collection ${exampleCollection?.collectionId}`} md={12} xs={24} sm={24}>
            {exampleCollection && <MetadataDisplay collectionId={1n} />}
          </DisplayCard>
        </div>
        <div className="flex-center flex-wrap px-20" style={{ alignItems: 'normal' }}>
          <DisplayCard
            title={'Code / Password Distribution'}
            md={12}
            xs={24}
            sm={24}
            subtitle="Distribute codes or passwords to users who meet criteria (e.g. check location, query if they were in attendance, etc).">
            <br />
            <div className="flex-center">
              <button
                className="landing-button"
                onClick={() => setPasswordIsVisible(!passwordIsVisible)}
                style={{ width: 200 }}>
                {passwordIsVisible ? 'Hide' : 'Check Something'}
              </button>
            </div>
            <br />
            {/* TODO: You will need to store the password and/or codes somewhere. */}
            {passwordIsVisible && (
              <>
                <div className="text-center">
                  Password: abc123
                  <br />
                  Code: 123456
                </div>
                <div className="text-center">
                  <a
                    href="https://bitbadges.io/collections/ADD_COLLECTION_ID_HERE?approvalId=APPROVAL_ID&code=CODE"
                    target="_blank"
                    rel="noreferrer">
                    Code Claim Link
                  </a>
                  <br />
                  <a
                    href="https://bitbadges.io/collections/ADD_COLLECTION_ID_HERE?approvalId=APPROVAL_ID&password=PASSWORD"
                    target="_blank"
                    rel="noreferrer">
                    Password Claim Link
                  </a>
                </div>
                <div className="text-center">
                  <a href="https://bitbadges.io/saveforlater?value=abc123" target="_blank" rel="noreferrer">
                    Save for Later Link
                  </a>
                </div>
              </>
            )}
          </DisplayCard>
          <DisplayCard
            title={`Balance Assignment`}
            md={12}
            xs={24}
            sm={24}
            subtitle="If your collection uses self-hosted off-chain balances, you can update the balances dynamically according to interactions. For example, maybe when a user pays a subscription fee, you allocate them x1 of the subscription badge.">
            <br />
            <div className="flex-center">
              <button
                className="landing-button"
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
                  console.log(res);
                  const fetchedBalance = res.balances[convertToCosmosAddress(addressToUpdate)];
                  alert(`Updated balances for ${addressToUpdate} to ${JSON.stringify(fetchedBalance)}`);

                  //TODO: If your collection is indexed, you will need to refresh the cached values on the BitBadges API (note there are cooldowns though)
                  // await BitBadgesApi.refreshMetadata(collectionId)
                }}
                style={{ width: 300 }}>
                {'Check Something and Update Balances'}
              </button>
            </div>
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
      }}>
      Get Private User Info
    </button>
  );
};

export default Home;
