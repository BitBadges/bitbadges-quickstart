import { BitBadgesApi } from '@/chains/api';
import { useSiwbbContext } from '@/chains/chain_contexts/siwbb/SIWBBContext';
import { useWeb2Context } from '@/chains/chain_contexts/web2/Web2Context';
import { AddressDisplay } from '@/components/address/AddressDisplay';
import { DisplayCard } from '@/components/display/DisplayCard';
import { Tabs } from '@/components/display/Tabs';
import { BlockinDisplay } from '@/components/insite/BlockinDisplay';
import { ManualDisplay } from '@/components/manual/manual';
import { SiwbbDisplay } from '@/components/siwbb/siwbb';
import { Web2Display } from '@/components/web2/web2';
import { fetchAccountsWithOptions, useAccount } from '@/redux/accounts/AccountsContext';
import { fetchCollectionsWithOptions, useCollection } from '@/redux/collections/CollectionsContext';
import { getBadgeIdsString } from '@/utils/badgeIds';
import { getTimeRangesString } from '@/utils/dates';
import { Avatar } from 'antd';
import { Balance, NumberType, getMetadataForBadgeId } from 'bitbadgesjs-sdk';
import { ChallengeParams, VerifyChallengeOptions } from 'blockin';
import { NextPage } from 'next/types';
import { useEffect, useMemo, useState } from 'react';
import { getPrivateInfo, signIn, signOut } from '../chains/backend_connectors';
import { useChainContext } from '../chains/chain_contexts/ChainContext';
import Header from '../components/Header';
import { BroadcastTxPopupButton, SignTxInSiteButton } from '../components/transactions';

const BalanceDisplay = ({ balances }: { balances: Balance<bigint>[] }) => {

  return <>
    <table className='w-100 text-center'>
      <tr>
        <th className='px-2'>Amount</th>
        <th className='px-2'>Badge IDs</th>
        <th className='px-2'>Times</th>
      </tr>
      {balances.map((balance) => {
        return <tr key={balance.toString()}>
          <td>x{balance.amount.toString()}</td>
          <td>{getBadgeIdsString(balance.badgeIds)}</td>
          <td>{getTimeRangesString(balance.ownershipTimes)}</td>
        </tr>
      })}
    </table>
  </>
}

const MetadataDisplay = ({ collectionId }: { collectionId: bigint }) => {
  const collection = useCollection(collectionId);
  const badgeIdOneMetadata = getMetadataForBadgeId(1n, collection?.cachedBadgeMetadata ?? []);

  return <>
    <div className='flex-center'>
      <div className='mx-8'>
        <div className='text-center my-3'>
          Collection  {collection?.collectionId.toString()}: {collection?.cachedCollectionMetadata?.name}
        </div>
        <div className='flex-center'>
          <Avatar
            src={collection?.cachedCollectionMetadata?.image.replace('ipfs://', "https://bitbadges-ipfs.infura-ipfs.io/ipfs/")}
            size={120}
            shape="square"
            className="rounded-lg"
          />
        </div>
      </div>
      <div className='mx-8'>
        <div className='text-center my-3'>
          Badge 1: {badgeIdOneMetadata?.name}
        </div>
        <div className='flex-center'>
          <Avatar
            src={badgeIdOneMetadata?.image.replace('ipfs://', "https://bitbadges-ipfs.infura-ipfs.io/ipfs/")}
            size={120}
            shape="square"
            className="rounded-lg"
          />
        </div>
      </div>
    </div >
  </>
}


const Home: NextPage = () => {
  const chain = useChainContext();
  const siwbbContext = useSiwbbContext();
  const web2Context = useWeb2Context();

  const [signInMethodTabSelected, setSignInMethodTab] = useState('web3');
  const signInMethodTab = web2Context.active ? 'web2' : signInMethodTabSelected;

  const [web3SignInTypeSelected, setWeb3SignInType] = useState('siwbb');
  const web3SignInType = chain.loggedIn ? siwbbContext.active ? 'siwbb' : 'insite' : web3SignInTypeSelected   //Use the active one if logged in

  const vitalikAccount = useAccount('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
  const exampleCollection = useCollection(1n);
  const [vitalikBalances, setVitalikBalances] = useState<Balance<bigint>[]>([]);


  useEffect(() => {
    fetchAccountsWithOptions([{
      address: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", fetchBalance: true,
      viewsToFetch: [{ viewId: 'badgesCollected', viewType: 'badgesCollected', bookmark: vitalikAccount?.views.badgesCollected?.pagination.bookmark ?? '' }]
    }]); //vitalik.eth

    fetchCollectionsWithOptions([{
      collectionId: 1n,
      viewsToFetch: [{ viewId: 'owners', viewType: 'owners', bookmark: exampleCollection?.views.owners?.pagination.bookmark ?? '' }],
      metadataToFetch: { badgeIds: [{ start: 1n, end: 1n }] }
    }, {
      collectionId: 16n,
      metadataToFetch: { badgeIds: [{ start: 1n, end: 1n }] }
    }]);


    BitBadgesApi.getBadgeBalanceByAddress(16n, '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045').then((res) => {
      setVitalikBalances(res.balance.balances);
    });
  }, [])


  //TODO: Customize
  // Function to generate challengeParams. Refreshes every 60 seconds to refresh issuedAt / expirationDate
  const generateChallengeParams = () => {
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
        assets: [{
          chain: 'BitBadges',
          collectionId: 1,
          assetIds: [{ start: 9, end: 9 }],
          mustOwnAmounts: { start: 0, end: 0 },
          ownershipTimes: [],
        }]
      }
    } as ChallengeParams<NumberType>;
  };

  // Define state to hold the challengeParams
  const [challengeParams, setChallengeParams] = useState<ChallengeParams<NumberType>>(generateChallengeParams());


  // useEffect to update challengeParams every 60 seconds
  useEffect(() => {
    setChallengeParams(generateChallengeParams());

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


  const verifyOnBackend = async (message: string, signature: string, sessionDetails: {
    username?: string,
    password?: string,
    siwbb?: boolean,
  }, verifyOptions?: VerifyChallengeOptions, publicKey?: string) => {

    try {
      const backendChecksRes = await signIn(message, signature, sessionDetails, verifyOptions, publicKey);
      if (!backendChecksRes.success) throw new Error(backendChecksRes.errorMessage ?? 'Error');
    } catch (e: any) {
      console.log(e.errorMessage ?? e.message ?? e);
      alert(e.errorMessage ?? e.message ?? e);
      throw e;
    }
  }



  return (
    <>
      <Header />
      <div>
        <div className='px-20'>
          <DisplayCard title='Authentication' md={24} xs={24} sm={24}>
            <br />
            <div className='flex-center'>
              <Tabs
                tab={signInMethodTab}
                setTab={async (tab) => {
                  if (chain.loggedIn) await signOut();
                  setSignInMethodTab(tab)
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
            {signInMethodTab == 'web3' && <>
              <div className='flex-center'>
                <Tabs type='underline'
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
            </>}
            {signInMethodTab == 'web2' && (
              <Web2Display
                verifyOnBackend={verifyOnBackend}
                challengeParams={challengeParams}
                verifyOptions={{
                  issuedAtTimeWindowMs: 5 * 60 * 1000, //5 minute "redeem" window
                  expectedChallengeParams,
                }}
              />
            )}
            {signInMethodTab == 'web3' && web3SignInType == 'insite' &&
              <div className='flex-center flex-column'>
                <BlockinDisplay
                  verifyOnBackend={verifyOnBackend}
                  challengeParams={challengeParams}
                  verifyOptions={{
                    issuedAtTimeWindowMs: 5 * 60 * 1000, //5 minute "redeem" window
                    expectedChallengeParams,
                  }}
                />
              </div>
            }
            {signInMethodTab == 'web3' && web3SignInType == 'siwbb' && <SiwbbDisplay verifyOnBackend={verifyOnBackend} challengeParams={challengeParams} verifyOptions={{ issuedAtTimeWindowMs: 5 * 60 * 1000, expectedChallengeParams }} />}
            <br />
            <br />
            <br />
            {signInMethodTab !== 'manual' && <>
              <div className='flex-center flex-wrap'>
                <SecretInfoButton />
                <SignTxInSiteButton signInMethodTab={signInMethodTab} web3SignInType={web3SignInType} />
                <BroadcastTxPopupButton signInMethodTab={signInMethodTab} />
              </div>
            </>}
          </DisplayCard>
        </div>
        <div className='flex-center flex-wrap px-20' style={{ alignItems: 'normal' }}>
          <DisplayCard title={
            <div className='flex-center'>
              <AddressDisplay addressOrUsername={vitalikAccount?.address ?? ''} fontSize={24} />
            </div>} md={12} xs={24} sm={24}>
            <div className='text-center'>
              {vitalikAccount?.balance?.amount.toString()} $BADGE
            </div>
            <MetadataDisplay collectionId={16n} />
            <br />
            <div className='flex-center'>
              Collection {16} Balances
            </div>
            <div className='flex-center'>
              <BalanceDisplay balances={vitalikBalances} />
            </div>
          </DisplayCard>
          <DisplayCard title={`Collection ${exampleCollection?.collectionId}`} md={12} xs={24} sm={24}>
            <MetadataDisplay collectionId={1n} />

          </DisplayCard>
        </div>
      </div >
    </>
  )
}

const SecretInfoButton = () => {
  return (
    <button
      className='landing-button m-2' style={{ width: 200 }} onClick={async () => {
        const res = await getPrivateInfo();
        alert(res.message);
      }}>
      Get Private User Info
    </button>
  )
}

export default Home;