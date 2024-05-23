import { signIn } from '@/chains/backend_connectors';
import { useChainContext } from '@/chains/chain_contexts/ChainContext';
import { VerifyChallengeOptions } from 'blockin/dist/types/verify.types';
import { useState } from 'react';
import { Tabs } from '../display/Tabs';

export const ManualDisplay = ({
  verifyManually
}: {
  verifyManually: (
    message: string,
    signature: string,
    options: VerifyChallengeOptions,
    publicKey?: string
  ) => Promise<void>;
}) => {
  const chain = useChainContext();

  const [message, setMessage] = useState(
    'http://localhost:3000 wants you to sign in with your Solana account:\n4ZssFcjJkZHFChMdkUj6oyX853EUTrrK4wRPKLVbEnWP\n\nBy signing in, you agree to the privacy policy and terms of service.\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 1\nNonce: *\nIssued At: 2024-05-10T12:53:15.503Z\nExpiration Time: 2029-05-09T12:53:15.503Z\nResources:\nAsset Ownership Requirements:\n- Requirement :\n    Chain: BitBadges\n    Collection ID: 1\n    Asset IDs: 9 to 9\n    Ownership Time: Authentication Time\n    Ownership Amount: x0\n\n'
  );
  const [signature, setSignature] = useState(
    '08486f8da05f2f4308f0d63a6aa3faff255d7f5d0716a4f2a17fdd8f8f117238584bfa962c2aab5953554effac836c73c04bf5a1342a07b90ea461971ee58e02'
  );
  const [qrCode, setQrCode] = useState('');
  const [tab, setTab] = useState('manual');

  //This manually verifies a (message, signature) pair using the BitBadges API and your backend
  //Manual verification means no authentication code is cached by BitBadges
  const manualVerify = async (
    message: string,
    signature: string,
    options: VerifyChallengeOptions,
    publicKey?: string
  ) => {
    try {
      const res = await verifyManually(message, signature, options, publicKey);
      console.log(res);

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
              const publicKey = await chain.getPublicKey();
              await manualVerify(message, signature, {}, publicKey ?? '');
            } else {
              await signIn(qrCode);
            }
          }}
        >
          {tab == 'qr' ? 'Fetch and Verify' : 'Verify'}
        </button>
      </div>
    </>
  );
};
