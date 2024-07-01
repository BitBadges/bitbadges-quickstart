//Signs a transaction in-site.
//This is only applicable if you have users connect wallets to your site

import { useChainContext } from '@/chains/chain_contexts/ChainContext';
import { CoolButton } from '@/pages';
import { Spin, notification } from 'antd';
import {
  // Native x/badges Msgs also have helper types exported from the SDK w/ NumberType conversions
  // You can use these or the native Proto types
  // If you use the helpers, you can use the .toProto() to get the proto converted object where necessary
  // MsgTransferBadges,
  // MsgCreateCollection,
  MsgDeleteCollection,
  MsgTransferBadges,
  NumberType,
  UintRangeArray,
  //All Msgs are exported from the SDK as proto types (Protocol Buffers). This includes all native Cosmos modules.
  proto
} from 'bitbadgesjs-sdk';
import { useEffect, useState } from 'react';

const MsgSend = proto.cosmos.bank.v1beta1.MsgSend;

interface TxInfo {
  type: string;
  msg: object;
}

//Broadcast popup helper tool button. Outsource the transaction signing to a popup window.
//Note users can also manually sign through the official BitBadges frontend as well
//https://docs.bitbadges.io/for-developers/create-and-broadcast-txs/sign-+-broadcast-bitbadges.io
export const BroadcastTxPopupButton = ({}: {}) => {
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
      <CoolButton
        className="m-2"
        disabled={!chain.address || !chain.loggedIn || loading}
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
      </CoolButton>
    </>
  );
};
