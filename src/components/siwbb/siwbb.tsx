import { signOut } from '@/chains/backend_connectors';
import { useChainContext } from '@/chains/chain_contexts/ChainContext';
import { useSiwbbContext } from '@/chains/chain_contexts/siwbb/SIWBBContext';
import { NumberType, Numberify, SecretsProof, getChainForAddress, iSecretsProof } from 'bitbadgesjs-sdk';
import { ChallengeParams, VerifyChallengeOptions, constructChallengeObjectFromString } from 'blockin';
import { SignInWithBitBadgesButton } from 'blockin/dist/ui';
import { useState } from 'react';
import { DevMode } from '../DevMode';
import { AddressDisplay } from '../address/AddressDisplay';

export const SiwbbDisplay = ({
  verifyOnBackend,
  challengeParams,
  verifyOptions,
  devMode
}: {
  verifyOnBackend: (
    message: string,
    signature: string,
    sessionDetails: { username?: string; password?: string; siwbb?: boolean },
    options?: VerifyChallengeOptions,
    secretsProofs?: iSecretsProof<bigint>[]
  ) => Promise<void>;
  challengeParams: ChallengeParams<NumberType>;
  verifyOptions?: VerifyChallengeOptions;
  devMode?: boolean;
}) => {
  const chain = useChainContext();
  const siwbbContext = useSiwbbContext();
  const buttonStyle = {
    backgroundColor: 'black',
    fontSize: 14,
    fontWeight: 600,
    color: 'white'
  };

  const popupParams = {
    name: 'Website Sign In',
    description: 'To gain access to premium features, please sign in.',
    image: 'https://bitbadges-ipfs.infura-ipfs.io/ipfs/QmPfdaLWBUxH6ZrWmX1t7zf6zDiNdyZomafBqY5V5Lgwvj',
    challengeParams: challengeParams,
    allowAddressSelect: true,
    verifyOptions: verifyOptions,
    expectVerifySuccess: true,
    expectSecretsProofs: true
  };

  const [siwbbRes, setSiwbbRes] = useState<{
    message: string;
    signature: string;
    verificationResponse: { success: boolean; errorMessage?: string };
    secretsProofs: any;
  } | null>(null);

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
            <SignInWithBitBadgesButton
              //TODO: Customize your popup parameters here. See the documentation for more details.

              popupParams={popupParams}
              onSignAndBlockinVerify={async (message, signature, _verificationResponse, _secretsProofs) => {
                //TODO: Handle pre-checks
                //want to cache the signature and message for later use?
                //If verifying with assets, is the asset transferable and prone to flash ownership attacks?
                //If so, handle accordingly here (e.g. one use per asset, etc)
                //Expected whitelist / blacklist of addresses signing in?

                // Here, you can check what the verification response was from the popup callback
                // This is useful to fail early, but you should not trust it unless additional measures are taken.
                // A TLDR is that the poopup verification is executed client side, but other checks / sessions are handled on your backend.
                // Thus, we must ensure that the values passed to the backend are not manipulated, but without CORS or additional measures taken,
                // this is not guaranteed.
                //
                // It is typically easiest to verify the (message, signature) yourself on the backend.
                console.log(_verificationResponse, message, signature, _secretsProofs);
                if (!_verificationResponse.success) throw new Error(_verificationResponse.errorMessage ?? 'Error');

                setSiwbbRes({
                  message,
                  signature,
                  verificationResponse: _verificationResponse,
                  secretsProofs: _secretsProofs
                });

                // Verify on your backend and handle sessions
                const secretsProofs: iSecretsProof<bigint>[] = _secretsProofs?.map((proof) => new SecretsProof(proof));
                await verifyOnBackend(message, signature, { siwbb: true }, verifyOptions, secretsProofs);
                const challengeObj = constructChallengeObjectFromString(message, Numberify);
                chain.setLoggedInAddress(challengeObj.address);

                siwbbContext.setActive(true);
                siwbbContext.setAddress(challengeObj.address);
                siwbbContext.setChain(getChainForAddress(challengeObj.address));

                //TODO: Handle any other frontend logic here
              }}
            ></SignInWithBitBadgesButton>
          </>
        )}
      </div>
      <DevMode obj={siwbbRes && chain.loggedIn ? siwbbRes : popupParams} toShow={devMode} />
    </>
  );
};
