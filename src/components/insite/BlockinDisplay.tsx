import { signOut } from '@/chains/backend_connectors';
import { useAccount } from '@/chains/chain_contexts/AccountsContext';
import { SignChallengeResponse, useChainContext } from '@/chains/chain_contexts/ChainContext';
import { Avatar, Typography, notification } from 'antd';
import { NumberType, Numberify, SupportedChain } from 'bitbadgesjs-sdk';
import {
  ChallengeParams,
  SignAndVerifyChallengeResponse,
  SupportedChainMetadata,
  VerifyChallengeOptions,
  constructChallengeObjectFromString
} from 'blockin';
import { BlockinUIDisplay } from 'blockin/dist/ui';
import Image from 'next/image';
import { BITCOIN_LOGO, SOLANA_LOGO } from '../../../constants';
import { AddressDisplay } from '../address/AddressDisplay';
import { BlockiesAvatar } from '../address/Blockies';

const { Text } = Typography;

export const BlockinDisplay = ({
  hideLogo,
  hideLogin,
  verifyOnBackend,
  challengeParams,
  verifyOptions
}: {
  hideLogo?: boolean;
  hideLogin?: boolean;
  verifyOnBackend: (
    message: string,
    signature: string,
    sessionDetails: { username?: string; password?: string; siwbb?: boolean },
    options?: VerifyChallengeOptions,
    publicKey?: string
  ) => Promise<void>;
  challengeParams: ChallengeParams<NumberType>;
  verifyOptions?: VerifyChallengeOptions;
}) => {
  const { address, loggedIn, setLoggedInAddress, connect, disconnect, signChallenge, chain, setChain, connected } =
    useChainContext();

  const userInfo = useAccount(address);
  const account = userInfo;
  const avatar = account?.profilePicUrl ?? account?.avatar;

  const handleSignChallenge = async (challenge: string) => {
    const response = await signChallenge(challenge);
    return response;
  };

  const challengeParamsWithConnectedAccount = {
    ...challengeParams,
    address
  };

  const handleVerifyChallenge = async (message: string, signature: string, publicKey?: string) => {
    try {
      //Verify the pair on your backend and handle sessions
      //Replay attacks are handled via the issuedAtTimeWindow in verifyOptions

      await verifyOnBackend(
        message,
        signature,
        {
          //nothing here bc we are signing normally
        },
        verifyOptions,
        publicKey
      );

      /**
       * At this point, the user has been verified by your backend and Blockin. Here, you will do anything needed
       * on the frontend to grant the user access such as setting loggedIn to true, adding cookies, or
       * anything else that needs to be updated.
       */

      const challengeObj = constructChallengeObjectFromString(message, Numberify);
      setLoggedInAddress(challengeObj.address);
      return {
        success: true,
        message: 'Successfully signed in.'
      };
    } catch (e: any) {
      if (e.response.data) throw new Error(e.response.data.message);
      throw new Error(e.message);
    }
  };

  const signAndVerifyChallenge = async (challenge: string) => {
    const signChallengeResponse: SignChallengeResponse = await handleSignChallenge(challenge);
    //Check if error in challenge signature
    if (!signChallengeResponse.message || !signChallengeResponse.signature) {
      return { success: false, message: `${signChallengeResponse.message}` };
    }

    const verifyChallengeResponse: SignAndVerifyChallengeResponse = await handleVerifyChallenge(
      signChallengeResponse.message,
      signChallengeResponse.signature,
      signChallengeResponse.publicKey
    );

    return verifyChallengeResponse;
  };

  /**
   * This is where the chain details in ChainContext are updated upon a new chain being selected.
   */
  const handleUpdateChain = async (newChainMetadata: SupportedChainMetadata) => {
    if (newChainMetadata?.name) {
      setChain(newChainMetadata.name as SupportedChain);
    }
  };

  const logout = async () => {
    await signOut();
    setLoggedInAddress('');
  };

  return (
    <>
      <div className="flex-center primary-text img-overrides" style={{ marginTop: 10 }}>
        {
          <BlockinUIDisplay
            connected={connected}
            connect={async () => {
              try {
                await connect();
              } catch (e: any) {
                console.error(e);
                notification.error({
                  message: e.message,
                  description: `Error connecting to wallet. ${e.message === 'User Rejected' ? 'This often occurs when you are not signed in to your wallet before attempting to connect.' : ''}`
                });
              }
            }}
            buttonStyle={{ height: 45 }}
            modalStyle={{ color: `white`, textAlign: 'start' }}
            disconnect={async () => {
              disconnect();
            }}
            chainOptions={[
              //These should match what ChainDrivers are implemented in your backend.
              { name: 'Ethereum' },
              { name: 'Cosmos' },
              {
                name: 'Solana',
                logo: SOLANA_LOGO,
                abbreviation: 'SOL',
                getAddressExplorerUrl: (address: string) => `https://explorer.solana.com/address/${address}`
              },
              {
                name: 'Bitcoin',
                logo: BITCOIN_LOGO,
                abbreviation: 'BTC',
                getAddressExplorerUrl: (address: string) => `https://www.blockchain.com/btc/address/${address}`
              }
            ]}
            address={address}
            onChainUpdate={handleUpdateChain}
            challengeParams={challengeParamsWithConnectedAccount}
            loggedIn={loggedIn}
            logout={async () => {
              await logout();
            }}
            selectedChainName={chain}
            accessTiers={[
              {
                assetConditionGroup: {
                  assets: [
                    {
                      collectionId: 1,
                      chain: 'BitBadges',
                      assetIds: [{ start: 9, end: 9 }],
                      ownershipTimes: [],
                      mustOwnAmounts: { start: 0, end: 0 }
                    }
                  ]
                },
                name: 'General Access',
                description: (
                  <>
                    To protect against known scammers and unwanted visitors, we do not allow access to this site if you
                    have the scammer badge.,
                  </>
                ),
                image: '/images/bitbadgeslogo.png',
                frozen: true,
                defaultSelected: true
              }
            ]}
            signAndVerifyChallenge={signAndVerifyChallenge}
            hideConnectVsSignInHelper={hideLogin}
            maxTimeInFuture={168 * 60 * 60 * 1000} //1 week
          />
        }
      </div>
      {!hideLogo && (
        <>
          <div>
            {!(hideLogo && !connected) && (
              <Avatar
                size={200}
                shape="square"
                className="rounded-lg"
                src={
                  connected ? (
                    <BlockiesAvatar avatar={avatar} address={address.toLowerCase()} fontSize={200} />
                  ) : (
                    <Image
                      src="/images/bitbadgeslogo.png"
                      alt="BitBadges Logo"
                      height={180}
                      width={180}
                      quality={100}
                    />
                  )
                }
                style={{ marginTop: 40 }}
              />
            )}
          </div>
          <div className="flex-center">
            {' '}
            {connected && <AddressDisplay addressOrUsername={address} fontSize={24} />}
          </div>
          <div>
            {' '}
            {connected && (
              <Text strong className="primary-text" style={{ fontSize: 20 }}>
                {loggedIn ? 'Signed In' : 'Not Signed In'}
              </Text>
            )}
          </div>
        </>
      )}
    </>
  );
};
