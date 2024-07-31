import { signOut } from '@/chains/backend_connectors';
import { useChainContext } from '@/chains/chain_contexts/ChainContext';
import { CodeGenQueryParams, NumberType, generateBitBadgesAuthUrl } from 'bitbadgesjs-sdk';
import { AssetConditionGroup } from 'blockin';
import { AddressDisplay } from '../address/AddressDisplay';

const buttonStyle = {
  width: 250,
  backgroundColor: 'black',
  fontSize: 14,
  fontWeight: 600,
  color: 'white'
};

export const SiwbbDisplay = ({ ownershipRequirements }: { ownershipRequirements: AssetConditionGroup<NumberType> }) => {
  const chain = useChainContext();

  //TODO: Customize your popup parameters. See the documentation for more details.
  const popupParams: CodeGenQueryParams = {
    // You can also remove these and we will just display your apps metadata

    // name: 'Website Sign In',
    // description: 'To gain access to premium features, please sign in.',
    // image: 'https://bitbadges-ipfs.infura-ipfs.io/ipfs/QmPfdaLWBUxH6ZrWmX1t7zf6zDiNdyZomafBqY5V5Lgwvj',

    ownershipRequirements: ownershipRequirements,
    expectVerifySuccess: true,
    expectAttestationsPresentations: false,
    client_id: 'example-client-id', //TODO: Add your client ID here
    redirect_uri: 'http://localhost:3002/api/signIn', //TODO: Add your redirect URI here (if applicable) or undefined (if not applicable and using QR codes)
    //state: '',
    //scope: '',
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
                style={buttonStyle}>
                <div className="flex items-center justify-center hover:opacity-80 bg-gray-800 p-4 rounded-lg">
                  Sign Out
                </div>
              </button>
            </div>
            <br />
            <AddressDisplay addressOrUsername={chain.address} />
            <br />
          </>
        ) : (
          <>
            <br />
            <button
              className="blockin-button"
              onClick={() => {
                const authUrl = generateBitBadgesAuthUrl(popupParams);
                window.location.href = authUrl;
              }}
              style={buttonStyle}>
              <div className="flex items-center justify-center hover:opacity-80 bg-gray-800 p-4 rounded-lg">
                Sign In with{' '}
                <img
                  src="https://bitbadges.io/images/bitbadgeslogotext.png"
                  style={{ height: 20, marginLeft: 5 }}
                  alt="BitBadges"
                />
              </div>
            </button>
          </>
        )}
      </div>
    </>
  );
};
