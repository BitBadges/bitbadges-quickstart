import { NumberType, Numberify } from "bitbadgesjs-sdk";
import { getChainForAddress } from "bitbadgesjs-sdk";
import { ChallengeParams, VerifyChallengeOptions, constructChallengeObjectFromString } from "blockin";
import { SignInWithBitBadgesButton } from "blockin/dist/ui";
import { AddressDisplay } from "../address/AddressDisplay";
import { useChainContext } from "@/chains/chain_contexts/ChainContext";
import { useSiwbbContext } from "@/chains/chain_contexts/siwbb/SIWBBContext";

export const SiwbbDisplay = ({
  verifyOnBackend,
  challengeParams,
  verifyOptions,
}: {
  verifyOnBackend: (message: string, signature: string, sessionDetails: { username?: string, password?: string, siwbb?: boolean }, options?: VerifyChallengeOptions) => Promise<void>;
  challengeParams: ChallengeParams<NumberType>;
  verifyOptions?: VerifyChallengeOptions;
}) => {

  const chain = useChainContext();
  const siwbbContext = useSiwbbContext();

  const buttonStyle = {
    backgroundColor: 'black',
    fontSize: 14, fontWeight: 600, color: 'white',
  }


  return <>

    <div className='flex-center flex-column'>
      {chain.address && chain.loggedIn ? (<>
        <br />
        <div className='flex-center'>
          <button className='blockin-button' onClick={chain.disconnect} style={buttonStyle}>
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

            popupParams={{
              name: 'Website Sign In',
              description: 'To gain access to premium features, please sign in.',
              image: 'https://bitbadges-ipfs.infura-ipfs.io/ipfs/QmPfdaLWBUxH6ZrWmX1t7zf6zDiNdyZomafBqY5V5Lgwvj',
              challengeParams: challengeParams,
              allowAddressSelect: true,
              verifyOptions: verifyOptions,
              expectVerifySuccess: true
            }}

            onSignAndBlockinVerify={async (message, signature, _verificationResponse) => {
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
              if (!_verificationResponse.success) throw new Error(_verificationResponse.errorMessage ?? 'Error');

              // Verify on your backend and handle sessions
              await verifyOnBackend(message, signature, { siwbb: true }, verifyOptions)

              siwbbContext.setActive(true);
              siwbbContext.setAddress(constructChallengeObjectFromString(message, Numberify).address);
              siwbbContext.setChain(getChainForAddress(constructChallengeObjectFromString(message, Numberify).address));

              //TODO: Handle any other frontend logic here
            }}
          >
          </SignInWithBitBadgesButton>
        </>
      )}
    </div>
  </>
}