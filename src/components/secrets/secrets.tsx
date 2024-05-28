import {
  BigIntify,
  NumberType,
  SecretsProof,
  iSecretsProof,
  verifySecretsPresentationSignatures
} from 'bitbadgesjs-sdk';
import { useState } from 'react';
import { DevMode } from '../DevMode';
import { Tabs } from '../display/Tabs';

const standardExample: iSecretsProof<NumberType> = {
  createdBy: 'cosmos1zd5dsage58jfrgmsu377pk6w0q5zhc67fn4gsl',
  scheme: 'standard',
  dataIntegrityProof: {
    signer: '4ZssFcjJkZHFChMdkUj6oyX853EUTrrK4wRPKLVbEnWP',
    signature:
      '877cca561369458ac00a1cbfbf2087dcbad32e881b170287b54ae8a94490e1f5ff1e4e1ef3b13c31b20c1e0bcc09b7f4665958ba7c68f1d11f7974a395445e0d',
    publicKey: 'NP8pWIQxnGVJgE6NsmyTafmXksOqfWx8bJRnf6YhDWQ='
  },
  secretMessages: ['Test message'],
  name: 'Standard Proof',
  description: 'This is a standard proof signed by a antive address',
  image: 'ipfs://QmbG3PyyQyZTzdTBANxb3sA8zC37VgXndJhndXSBf7Sr4o',
  anchors: [],
  updateHistory: [
    {
      txHash: '',
      block: '497618',
      blockTimestamp: '1713623123898',
      timestamp: '1713623125359'
    }
  ],
  messageFormat: 'plaintext',
  proofOfIssuance: {
    message: '',
    signer: '',
    signature: '',
    publicKey: ''
  }
};

const bbsExample: iSecretsProof<NumberType> = {
  createdBy: 'cosmos1zd5dsage58jfrgmsu377pk6w0q5zhc67fn4gsl',
  scheme: 'bbs',
  messageFormat: 'plaintext',
  secretMessages: ['asdfasfdasdfadsf'],
  dataIntegrityProof: {
    signature:
      '0001018d260ab0a25d52e82454ad45a0198eb7dc3bd625f1dcbe582bd9a7ae8b7d602b4854795c06f3b518cabcaed61ceb1ad2a1f79282f51e44717899ce62158947717eba690d9beff229391cf312caa6177a820515294300684c59573c0e63b1856c865691ca4a3b63a321efb7c2b698fea16dcf4098ae68d30287c35348a13ea3eaf432ab615dfd50e5a13e50ea40496e7d000000749853d27c3af8550e7a8bcaab21af5856e313e6b2d2c59d3a50e485a01d7b6edaf6de44f9329204005aa9ec3ece237a250000000261311b5146edf02dfe1e71e92cf5d0a2a6b481f0e9b029d4c0adce33634391201e122a5c14ffaf6b1ababc4ae05bd33ad9688285a7f5099d507645999a91e7388484250a61e93fb5cefe4d3a982a66542e2d2c4f289edf993363a9244fe5d4b21a5646a966c1fb4893a5980906aa55b700000002593b2ca671b7e4b04a93e4a6564a80605cf208d2eef4957e80153ee9e403caea6aadf0250cef0428ba88bb604c0efae104a546c36b96ddcadeefaca7129ce6fc',
    signer:
      'a5159099a24a8993b5eb8e62d04f6309bbcf360ae03135d42a89b3d94cbc2bc678f68926373b9ded9b8b9a27348bc755177209bf2074caea9a007a6c121655cd4dda5a6618bfc9cb38052d32807c6d5288189913aa76f6d49844c3648d4e6167'
  },
  proofOfIssuance: {
    message:
      'I approve the issuance of secrets signed with BBS+ a5159099a24a8993b5eb8e62d04f6309bbcf360ae03135d42a89b3d94cbc2bc678f68926373b9ded9b8b9a27348bc755177209bf2074caea9a007a6c121655cd4dda5a6618bfc9cb38052d32807c6d5288189913aa76f6d49844c3648d4e6167 as my own.\n\n',
    signer: '4ZssFcjJkZHFChMdkUj6oyX853EUTrrK4wRPKLVbEnWP',
    signature:
      '74bbe0444f9fc566f55cdd7f4f202f7ec3b35afc79f5b4d0048bde73cb7cfd8fb4008729738dde5d302af6973ddc7fb8db079fcf3fed71ce153bfa0f24ea9808',
    publicKey: 'NP8pWIQxnGVJgE6NsmyTafmXksOqfWx8bJRnf6YhDWQ='
  },
  name: 'Diploma',
  image: 'ipfs://Qmcwju5WQJuAiJBJasu3JPzFTqKGfu1EDAQonxrrVhvpLV',
  description: 'dhgfjajshgkdf',
  entropies: ['450c22565e67871b3649ad6508de2e586e17ba8dc317eaeb08b3b0c8ff7ed63c'],
  updateHistory: [
    {
      txHash: '',
      block: '1',
      blockTimestamp: '0',
      timestamp: '1713618181065'
    },
    {
      txHash: '',
      block: '1',
      blockTimestamp: '0',
      timestamp: '1713618192610'
    }
  ],
  anchors: []
};

export const VerifySecrets = ({ devMode }: { devMode?: boolean }) => {
  const [secretProof, setSecretProof] = useState<iSecretsProof<bigint> | null>(
    new SecretsProof(bbsExample).convert(BigIntify)
  );

  const [verified, setVerified] = useState<boolean | null>(null);

  const verifyProof = async (proof: iSecretsProof<bigint>) => {
    if (!proof) return;

    await verifySecretsPresentationSignatures(proof, true);

    //TODO: Once you are here, the proofs are well-formed from a cryptographic perspective.
    //In other words, proof.createdBy issued the secret and the secret is well-formed with data integrity
    //TODO: However, we DO NOT know the expected contents of the secret. This is application-specific.
    //This includes the expected creator, metadata, messages, etc.
  };

  return (
    <>
      <div className="flex-center flex-column">
        <Tabs
          customClass="mb-3"
          tab={secretProof?.scheme === 'bbs' ? 'bbs' : 'standard'}
          setTab={(tab) => {
            setSecretProof(
              tab === 'bbs'
                ? new SecretsProof(bbsExample).convert(BigIntify)
                : new SecretsProof(standardExample).convert(BigIntify)
            );
            setVerified(null);
          }}
          type="underline"
          tabInfo={[
            {
              key: 'bbs',
              content: 'BBS'
            },
            {
              key: 'standard',
              content: 'Standard'
            }
          ]}
        />
        <div className="text-center secondary-text mt-3">
          {secretProof?.scheme === 'bbs' &&
            'BBS proofs are signed with a BBS key pair. They offer unique properties like selective disclosure (i.e. if the secret has N messages, you can generate a proof for any subset of the messages).'}
          {secretProof?.scheme === 'standard' &&
            "Standard proofs are signed with the creator's native key pair and are verified as normal signatures."}
        </div>

        <div className="flex-center">
          <button
            className="landing-button mt-8"
            onClick={async () => {
              window.open('https://bitbadges.io/secrets/create', '_blank');
            }}
          >
            Create
          </button>
          <button
            className="landing-button mt-8"
            disabled={!secretProof}
            onClick={async () => {
              if (!secretProof) return;
              try {
                await verifyProof(secretProof);
                setVerified(true);
              } catch (e) {
                console.log(e);
                console.error(e);
                setVerified(false);
              }
            }}
          >
            Verify
          </button>
        </div>

        {verified && (
          <p>
            Proof verified{' '}
            <span role="img" aria-label="check">
              ✅
            </span>
          </p>
        )}
        {!verified && verified !== null && (
          <p>
            Proof not verified{' '}
            <span role="img" aria-label="cross">
              ❌
            </span>
          </p>
        )}
      </div>
      {secretProof && <DevMode obj={secretProof} toShow={devMode} />}
    </>
  );
};
