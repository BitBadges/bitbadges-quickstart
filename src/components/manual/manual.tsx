import { VerifyChallengeOptions } from 'blockin';
import { useState } from 'react';
import { Tabs } from '../display/Tabs';
import { BitBadgesApi } from '@/chains/api';

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
    'http://localhost:3000 wants you to sign in with your Ethereum account:\n0xb246a3764d642BABbd6b075bca3e77E1cD563d78\n\nBy signing in, you agree to the privacy policy and terms of service.\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 1\nNonce: *\nIssued At: 2024-04-20T11:32:48.422Z\nExpiration Time: 2024-04-27T11:32:48.422Z\nResources:\nAsset Ownership Requirements:\n- Requirement :\n    Chain: BitBadges\n    Collection ID: 1\n    Asset IDs: 9 to 9\n    Ownership Time: Authentication Time\n    Ownership Amount: x0\n\n'
  );
  const [signature, setSignature] = useState(
    '0x2e0e92e73836dc26809e72d94777cbe1366016e91d7415d98dd90690e82d822662628e8f32866b32862a285781ae23ff48faf2cb1764a0d204e56780f1e37df21c'
  );
  const [qrCode, setQrCode] = useState('');

  const [tab, setTab] = useState('manual');

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
      <Tabs
        tab={tab}
        setTab={setTab}
        tabInfo={[
          {
            key: 'manual',
            content: 'Manual'
          },
          {
            key: 'qr',
            content: 'Authentication Code (BitBadges API)'
          }
        ]}
        fullWidth
        type="underline"
      />
      <br />
      {tab == 'manual' && (
        <>
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
          <div className="flex-center">
            <b className="primary-text text-center">Signature </b>
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
        </>
      )}
      <br />
      {tab == 'qr' && (
        <>
          <div className="flex-center">
            <b className="primary-text text-center">Authentication Code Value</b>
          </div>
          <div className="flex-center">
            <textarea
              placeholder="This is obtained by the user from their BitBadges account."
              className="input-box primary-text primary-border rounded"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              style={{ width: 500, height: 100, padding: 10, background: 'inherit' }}
            />
          </div>
          <br />
        </>
      )}

      <div className="flex-center mt-3">
        <button
          className="landing-button"
          style={{ width: 200 }}
          onClick={async () => {
            if (tab == 'manual') {
              await manualVerify(message, signature);
            } else {
              const fetchedAuthCode = await BitBadgesApi.getAuthCode({ id: qrCode, options: {} });
              console.log(fetchedAuthCode.verificationResponse); //Checked by the API but you should also check it here
              console.log(fetchedAuthCode.message);
              console.log(fetchedAuthCode.signature);

              const { message, signature } = fetchedAuthCode;
              await manualVerify(message, signature);
            }
          }}
        >
          {tab == 'qr' ? 'Fetch and Verify' : 'Verify'}
        </button>
      </div>
    </>
  );
};
