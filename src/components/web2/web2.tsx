import { createWeb2Account } from "@/chains/backend_connectors";
import { useChainContext } from "@/chains/chain_contexts/ChainContext";
import { NumberType, Numberify } from "bitbadgesjs-sdk";
import { createChallenge, constructChallengeObjectFromString, ChallengeParams, VerifyChallengeOptions } from "blockin";
import { useState } from "react";
import { AddressDisplay } from "../address/AddressDisplay";
import { useWeb2Context } from "@/chains/chain_contexts/web2/Web2Context";

export const Web2Display = ({
  verifyOnBackend,
  challengeParams,
  verifyOptions,
}: {
  verifyOnBackend: (message: string, signature: string, sessionDetails: { username?: string, password?: string, siwbb?: boolean }, options?: VerifyChallengeOptions) => Promise<void>;
  challengeParams: ChallengeParams<NumberType>;
  verifyOptions?: VerifyChallengeOptions;
}) => {
  const chain = useChainContext();
  const web2Context = useWeb2Context();

  const [username, setUsername] = useState('bob');
  const [password, setPassword] = useState('bobpassword');

  const signInWeb2 = async (createAccount: boolean) => {
    try {
      if (createAccount) {
        const res = await createWeb2Account(username, password);
        if (!res.success) throw new Error(res.message);
      }

      web2Context.setUsername(username)

      const message = createChallenge({ ...challengeParams, address: 'dummy address' });
      const res = await web2Context.signChallenge(message, username, password);
      const signature = res.signature;
      const mappedAddress = constructChallengeObjectFromString(res.message, Numberify).address;
      const messageWithAddress = res.message;

      //Step 2: Verify on your backend and handle sessions
      //Replay attacks are handled via the issuedAtTimeWindow in verifyOptions

      //will throw an error if not verified
      await verifyOnBackend(messageWithAddress, signature, { username, password }, {
        ...verifyOptions,
        expectedChallengeParams: {
          ...verifyOptions?.expectedChallengeParams,
          address: mappedAddress
        }
      });

      web2Context.setActive(true);

      /**
       * At this point, the user has been verified by your backend and Blockin. Here, you will do anything needed
       * on the frontend to grant the user access such as setting loggedIn to true, adding cookies, or 
       * anything else that needs to be updated.
       */
      return {
        success: true,
        message: 'Successfully signed in.',
      }

    } catch (e: any) {
      console.log(e);
      alert(e.errorMessage ?? e.message ?? e);
    }
  }


  return <>
    <div className='text-center secondary-text'>
      The web2 option is for traditional username / password logins. Behind the scenes, all usernames are mapped to a standard
      Cosmos address and private key. When signatures are required, we handle the signing and verification process for the user behind the
      scenes.
    </div>
    <br />
    {/* username / password boxes */}
    {!chain.loggedIn && <>
      <div className='flex-center'>
        <input
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='m-2 input-box primary-text primary-border rounded'
          style={{ width: 300, padding: 10, background: 'inherit' }}
        />
      </div>

      <div className='flex-center'>
        <input
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='m-2 input-box primary-text primary-border rounded'
          style={{ width: 300, padding: 10, background: 'inherit' }}
        />
      </div>
      <br />
      <div className='flex-center flex-wrap'>
        <button className='landing-button' onClick={async () => {
          await signInWeb2(false);
        }}>
          Sign In
        </button>

        <button className='landing-button'
          style={{ width: 220 }}
          onClick={async () => {
            try {
              await signInWeb2(true);
            } catch (e: any) {
              alert(e.errorMessage ?? e.message ?? e);
              console.log(e);
            }
          }}>
          Create Account + Sign In
        </button>

      </div>
    </>}
    <br />
    {chain.loggedIn && <><div className='flex-center'>
      <button className='landing-button' onClick={chain.disconnect}>
        Sign Out
      </button>
    </div>
      <br />
      <div className='flex-center primary-text'>
        Signed in as <b className='px-1'>@{username}</b>{' '} or behind the scenes as<div className="px-1"></div><AddressDisplay addressOrUsername={chain.address} />
      </div>
    </>}
  </>
}