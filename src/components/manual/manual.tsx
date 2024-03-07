import { VerifyChallengeOptions } from 'blockin';
import { useState } from 'react';

export const ManualDisplay = ({
  verifyOnBackend
}: {
  verifyOnBackend: (
    message: string,
    signature: string,
    sessionDetails: { username?: string; password?: string; siwbb?: boolean },
    options?: VerifyChallengeOptions
  ) => Promise<void>;
}) => {
  const [message, setMessage] = useState(
    `http://localhost:3000 wants you to sign in with your Ethereum account:\n0xf1F7198d9AE8c6975F43d2303D3D9aDea3821864\n\nBy signing in, you agree to the privacy policy and terms of service.\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 1\nNonce: *\nIssued At: 2024-02-07T13:17:27.365Z\nExpiration Time: 2024-02-14T13:17:27.365Z\nResources:\nAsset Ownership Requirements:\n- Requirement A-1:\n    Chain: BitBadges\n    Collection ID: 1\n    Asset IDs: 9 to 9\n    Ownership Time: Authentication Time\n    Ownership Amount: x0\n\n`
  );
  const [signature, setSignature] = useState(
    '0x95f200aa19798984e7d8ba733c5076df35c4a0f98c3af38f8e63bba09e9339f456abb34166b23ad50f128497519f3b8758712c8c95c7319b78424487bc35e42a1b'
  );

  //This manually verifies a (message, signature) pair using the BitBadges API and your backend
  //If the pair is stored by BitBadges, you can also use the await BitBadgesApi.getAuthCode(...) route
  const manualVerify = async (message: string, signature: string) => {
    try {
      //Alternative if you just have the signature AND the pair is cached / stored by BitBadges
      //You can fetch the pair directly. The route also verifies it for you, so this is all done in one step.
      //This is how BitBadges QR codes are implemented. BitBadges QR codes cannot package the message because it is too big, so
      //the QR code is just the signature. Thus, when you scan, you only have the signature and need the message.

      // const authCodeRes = await BitBadgesApi.getAuthCode({ signature, options: { issuedAtTimeWindowMs: 5 * 60 * 1000, expectedChallengeParams } });
      // const verificationResponse2 = authCodeRes.verificationResponse;
      // const message = authCodeRes.message;
      // if (!verificationResponse2.success) {
      //   throw new Error('Error verifying signature');
      // }

      await verifyOnBackend(
        message,
        signature,
        {},
        {
          //Add options
        }
      );

      //TODO: Prevent replay attacks,add verify options, handle sessions, etc based on your use case

      alert('Successfully verified!');
    } catch (e: any) {
      console.log(e);
      alert('Error verifying signature');
      throw e;
    }
  };

  return (
    <>
      {/* //message input */}
      <div className="text-center secondary-text px-10">
        The manual option is when the user manually provides you with their message and signature. This is typically for
        in-person events where they pre-generate their pair and present to you in-person, such as a QR code. For
        example, you might set up a QR code scanner that writes the values into the input boxes upon scanning and auto
        verifies. This example simply checks Blockin verification and does not actually sign you into the site because
        it is most likely used for non-digital verification. You need to handle sessions and prevent common attacks
        youself, as well as any application specific logic.
      </div>
      <br />
      <div className="flex-center">
        <b className="primary-text text-center">Message</b>
      </div>
      <div className="flex-center">
        <textarea
          placeholder="Message"
          className="input-box primary-text primary-border rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: 500, height: 500, padding: 10, background: 'inherit' }}
        />
      </div>
      <br />
      {/* //signature input */}
      {/* //message input */}
      <div className="flex-center">
        <b className="primary-text text-center">Signature</b>
      </div>
      <div className="flex-center">
        <textarea
          placeholder="Signature"
          className="input-box primary-text primary-border rounded"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          style={{ width: 500, height: 100, padding: 10, background: 'inherit' }}
        />
      </div>
      <br />

      <div className="flex-center">
        <button
          className="landing-button"
          onClick={async () => {
            await manualVerify(message, signature);
          }}
        >
          Verify
        </button>
      </div>
    </>
  );
};
