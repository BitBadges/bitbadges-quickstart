import { signOut } from '@/chains/backend_connectors';
import { useChainContext } from '@/chains/chain_contexts/ChainContext';
import { CodeGenQueryParams, NumberType } from 'bitbadgesjs-sdk';
import { ChallengeParams, VerifyChallengeOptions } from 'blockin';
import { SignInWithBitBadgesButton } from 'blockin/dist/ui';
import { AddressDisplay } from '../address/AddressDisplay';

export const SiwbbDisplay = ({
  challengeParams,
  verifyOptions
}: {
  challengeParams: ChallengeParams<NumberType>;
  verifyOptions?: VerifyChallengeOptions;
}) => {
  const chain = useChainContext();
  const buttonStyle = {
    backgroundColor: 'black',
    fontSize: 14,
    fontWeight: 600,
    color: 'white'
  };

  //TODO: Customize your popup parameters. See the documentation for more details.
  const popupParams: CodeGenQueryParams = {
    name: 'Website Sign In',
    description: 'To gain access to premium features, please sign in.',
    image: 'https://bitbadges-ipfs.infura-ipfs.io/ipfs/QmPfdaLWBUxH6ZrWmX1t7zf6zDiNdyZomafBqY5V5Lgwvj',
    challengeParams: challengeParams,
    allowAddressSelect: true,
    autoGenerateNonce: false,
    verifyOptions: verifyOptions,
    expectVerifySuccess: true,
    expectSecretsPresentations: false,
    clientId: 'a0582508118a4cd336f088b6aaced919978d23a4e38a41769d92c734007d7e82', //TODO: Add your client ID here
    // redirectUri: 'http://localhost:3002/api/signIn', //TODO: Add your redirect URI here (if applicable) or undefined (if not applicable)
    //state: '',
    redirectUri: undefined,
    otherSignIns: [] //['discord', 'twitter']
  };

  return (
    <>
      <div className="flex-center flex-column">
        {chain.address && chain.loggedIn ? (
          <>
            <br />
            <div className="flex-center">
              <button
                className="blockin-button"
                onClick={() => {
                  chain.disconnect();
                  chain.setLoggedInAddress('');
                  signOut();
                }}
                style={buttonStyle}
              >
                Sign Out
              </button>
            </div>
            <br />
            <AddressDisplay addressOrUsername={chain.address} />
            <br />
          </>
        ) : (
          <>
            <br />
            <SignInWithBitBadgesButton popupParams={popupParams} />
          </>
        )}
      </div>
    </>
  );
};
