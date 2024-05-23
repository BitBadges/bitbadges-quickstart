//Signs a transaction in-site.
//This is only applicable if you have users connect wallets to your site

import { useAccount } from '@/chains/chain_contexts/AccountsContext';
import { useChainContext } from '@/chains/chain_contexts/ChainContext';
import { Spin, notification } from 'antd';
import {
  BETANET_CHAIN_DETAILS,
  // Native x/badges Msgs also have helper types exported from the SDK w/ NumberType conversions
  // You can use these or the native Proto types
  // If you use the helpers, you can use the .toProto() to get the proto converted object where necessary
  // MsgTransferBadges,
  // MsgCreateCollection,
  MsgDeleteCollection,
  MsgTransferBadges,
  NumberType,
  TxContext,
  UintRangeArray,
  createTransactionPayload,
  //All Msgs are exported from the SDK as proto types (Protocol Buffers). This includes all native Cosmos modules.
  proto
} from 'bitbadgesjs-sdk';
import { useEffect, useMemo, useState } from 'react';
import { BitBadgesApi } from '../pages/api/bitbadges-api';

const MsgSend = proto.cosmos.bank.v1beta1.MsgSend;

//For Web2, we sign this behind the scenes with the mapped mnemonic for the user
export const SignTxInSiteButton = ({
  signInMethodTab,
  web3SignInType
}: {
  signInMethodTab: string;
  web3SignInType: string;
}) => {
  const chain = useChainContext();
  const signedInAccount = useAccount(chain.address);

  const txDetails: TxContext = useMemo(() => {
    return {
      chain: {
        ...BETANET_CHAIN_DETAILS,
        chain: chain.chain
      },
      sender: {
        accountAddress: signedInAccount?.cosmosAddress ?? '',
        sequence: Number(signedInAccount?.sequence ?? '0'),
        accountNumber: Number(signedInAccount?.accountNumber ?? '0'),
        pubkey: signedInAccount?.publicKey ?? ''
      },
      //Customize your fee here
      //The simulation response will return the gas used
      //You can also fetch gas prices from BitBadgesApi.getStatus()
      fee: {
        amount: `1`,
        denom: 'badge',
        gas: `200000`
      },
      memo: ''
    };
  }, [chain, signedInAccount]);

  return (
    <>
      <button
        className="landing-button m-2"
        style={{ width: 200 }}
        disabled={!chain.address || !chain.loggedIn || (signInMethodTab == 'web3' && web3SignInType == 'siwbb')}
        onClick={async () => {
          if (txDetails.sender.accountNumber < 0) {
            alert(
              'Account number is -1. Accounts need to be registered on the blockchain before signing transactions. To register, you can send them any amount of $BADGE (the account will also need it to pay for gas fees).'
            );
            return;
          }

          if (!txDetails.sender.pubkey) {
            const pubKey = await chain.getPublicKey();
            txDetails.sender.pubkey = pubKey;
          }

          //TODO: Build your transaction w/ proto converted messages here
          const protoMsgs = [
            // new MsgDeleteCollection({ creator: chain.cosmosAddress, collectionId: '1' }).toProto(),
            new MsgSend({
              fromAddress: chain.cosmosAddress,
              toAddress: 'cosmos14d0y596ujj7s40n7nxu86qg4c835p3xa8vucja',
              amount: [{ denom: 'badge', amount: '1' }]
            })
          ];

          const simulationPayload = createTransactionPayload(txDetails, protoMsgs);
          const simulatedTxBody = await chain.signTxn(txDetails, simulationPayload, true);

          try {
            const simulatedTxRes = await BitBadgesApi.simulateTx(simulatedTxBody);
            console.log(simulatedTxRes);
          } catch (e) {
            alert('Error simulating transaction. See console for details.');
            console.log(e);
            return;
          }

          const broadcastPayload = createTransactionPayload(txDetails, protoMsgs);
          const txBody = await chain.signTxn(txDetails, broadcastPayload, false);

          const initialRes = await BitBadgesApi.broadcastTx(txBody);
          if (initialRes.tx_response.code !== 0) {
            alert('Error broadcasting transaction. See console for details.');
            return;
          }

          notification.success({
            message: 'Transaction Broadcasted',
            description: `Transaction Hash: ${initialRes.tx_response.txhash}`
          });

          //Note that the transaction may not be confirmed right away
          //You can use the tx hash to check the status of the transaction

          //Forcefully update the account info (fetch new sequence and info)
          await signedInAccount?.fetchAndUpdate(BitBadgesApi, { fetchBalance: true, fetchSequence: true }, true);
        }}
      >
        Sign Transaction
      </button>
    </>
  );
};

interface TxInfo {
  type: string;
  msg: object;
}

//Broadcast popup helper tool button. Outsource the transaction signing to a popup window.
//Note users can also manually sign through the official BitBadges frontend as well
//https://docs.bitbadges.io/for-developers/create-and-broadcast-txs/sign-+-broadcast-bitbadges.io
export const BroadcastTxPopupButton = ({ signInMethodTab }: { signInMethodTab: string }) => {
  const [loading, setLoading] = useState(false);
  const chain = useChainContext();

  //TODO: Customize your transaction info here
  const [txsInfo, setTxsInfo] = useState<TxInfo[]>([
    {
      type: 'MsgDeleteCollection',
      msg: new MsgDeleteCollection({
        creator: chain.cosmosAddress,
        collectionId: '1'
      })
    },
    {
      type: 'MsgTransferBadges',
      msg: new MsgTransferBadges<NumberType>({
        creator: chain.cosmosAddress,
        collectionId: '1',
        transfers: [
          {
            from: chain.cosmosAddress,
            toAddresses: ['cosmos14d0y596ujj7s40n7nxu86qg4c835p3xa8vucja'],
            balances: [
              {
                amount: 1n,
                badgeIds: [{ start: 1n, end: 10n }],
                ownershipTimes: UintRangeArray.FullRanges()
              }
            ]
          }
        ]
      }).toProto()
    },
    {
      type: 'MsgSend',
      msg: new MsgSend({
        fromAddress: chain.cosmosAddress,
        toAddress: 'cosmos14d0y596ujj7s40n7nxu86qg4c835p3xa8vucja',
        amount: [{ denom: 'badge', amount: '1' }]
      })
    }
  ]);
  let x = false;
  if (x) console.log(setTxsInfo); //For TypeScript to not complain about unused variable

  //The creator and other fields may need to be dynamic based on the user's address
  //Options:
  //  1. Use the chain context to get the user's address and setTxsInfo directly (such as the useEffect below).
  //  2. Set autoPopulateCreator to true and BitBadges will auto-populate the creator field with the user's selected address.
  //     Note this does not work for all fields, just ones where signer must == creator.
  const autoPopulateCreator = true;
  // userMode is used to tell BitBadges how to display the transaction signing UI
  // For developers, we allow editing
  // For end users, we pretty it up and do now allow edits
  const userMode = true;

  useEffect(() => {
    setTxsInfo([
      {
        type: 'MsgDeleteCollection',
        msg: new MsgDeleteCollection({
          creator: chain.cosmosAddress,
          collectionId: '1'
        })
      },
      {
        type: 'MsgTransferBadges',
        msg: new MsgTransferBadges<NumberType>({
          creator: chain.cosmosAddress,
          collectionId: '1',
          transfers: [
            {
              from: chain.cosmosAddress,
              toAddresses: ['cosmos14d0y596ujj7s40n7nxu86qg4c835p3xa8vucja'],
              balances: [
                {
                  amount: 1n,
                  badgeIds: [{ start: 1n, end: 10n }],
                  ownershipTimes: UintRangeArray.FullRanges()
                }
              ]
            }
          ]
        }).toProto()
      },
      {
        type: 'MsgSend',
        msg: new MsgSend({
          fromAddress: chain.cosmosAddress,
          toAddress: 'cosmos14d0y596ujj7s40n7nxu86qg4c835p3xa8vucja',
          amount: [{ denom: 'badge', amount: '1' }]
        })
      }
    ]);
  }, [chain.cosmosAddress]);

  //https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
  const FRONTEND_URL = 'https://bitbadges.io';
  const handleChildWindowMessage = async (event: MessageEvent) => {
    if (event.source && event.origin === FRONTEND_URL) {
      const txHash = event.data.txHash;
      if (!txHash) return; //Probably a different message
      notification.success({
        message: 'Transaction Broadcasted',
        description: `Transaction Hash: ${txHash}`
      });
      setLoading(false);
    }
  };

  // Add a listener to handle messages from the child window
  useEffect(() => {
    window.addEventListener('message', handleChildWindowMessage);

    // Cleanup the listener when the component unmounts
    return () => {
      window.removeEventListener('message', handleChildWindowMessage);
    };
  }, []);

  return (
    <>
      <button
        className="landing-button m-2"
        style={{ width: 240 }}
        disabled={!chain.address || !chain.loggedIn || loading || signInMethodTab == 'web2'}
        onClick={async () => {
          const url = `https://bitbadges.io/dev/broadcast?txsInfo=${encodeURIComponent(JSON.stringify(txsInfo))}&autoPopulateCreator=${autoPopulateCreator}&userMode=${userMode}`;

          const openedWindow = window.open(
            url,
            '_blank',
            'location=yes,height=570,width=520,scrollbars=yes,status=yes'
          );

          setLoading(true);
          // You can further customize the child window as needed
          openedWindow?.focus();

          //set listener for when the child window closes
          const timer = setInterval(() => {
            if (openedWindow?.closed) {
              clearInterval(timer);
              setLoading(false);
            }
          }, 1000);
        }}
      >
        Sign Transaction (Popup) {loading && <Spin />}
      </button>
    </>
  );
};
