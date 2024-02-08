import { useSiwbbContext } from '@/chains/chain_contexts/siwbb/SIWBBContext';
import { useWeb2Context } from '@/chains/chain_contexts/web2/Web2Context';
import { Tabs } from '@/components/display/Tabs';
import { BlockinDisplay } from '@/components/insite/BlockinDisplay';
import { ManualDisplay } from '@/components/manual/manual';
import { SiwbbDisplay } from '@/components/siwbb/siwbb';
import { Web2Display } from '@/components/web2/web2';
import { NumberType } from 'bitbadgesjs-sdk';
import { ChallengeParams, VerifyChallengeOptions } from 'blockin';
import { NextPage } from 'next/types';
import { useEffect, useMemo, useState } from 'react';
import { getPrivateInfo, signIn, signOut } from '../chains/backend_connectors';
import { useChainContext } from '../chains/chain_contexts/ChainContext';
import Header from '../components/Header';
import { BroadcastTxPopupButton, SignTxInSiteButton } from '../components/transactions';


const Home: NextPage = () => {
  const chain = useChainContext();
  const siwbbContext = useSiwbbContext();
  const web2Context = useWeb2Context();

  const [signInMethodTabSelected, setSignInMethodTab] = useState('web3');
  const signInMethodTab = web2Context.active ? 'web2' : signInMethodTabSelected;

  const [web3SignInTypeSelected, setWeb3SignInType] = useState('siwbb');
  const web3SignInType = chain.loggedIn ? siwbbContext.active ? 'siwbb' : 'insite' : web3SignInTypeSelected   //Use the active one if logged in

  //TODO: Customize
  // Function to generate challengeParams. Refreshes every 15 seconds to refresh issuedAt / expirationDate
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


  // useEffect to update challengeParams every 15 seconds
  useEffect(() => {
    setChallengeParams(generateChallengeParams());

    // Set up interval to update challengeParams every 15 seconds
    const interval = setInterval(() => {
      setChallengeParams(generateChallengeParams());
    }, 15000);

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