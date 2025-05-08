import { StyledButton } from '@/components/display/StyledButton';
import { useChainContext } from '@/global/contexts/ChainContext';
import { Spin, notification } from 'antd';
import {
  MsgDeleteCollection,
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
        creator: chain.bitbadgesAddress,
        collectionId: '1',
        creatorOverride: ''
      })
    },
    {
      type: 'MsgSend',
      msg: new MsgSend({
        fromAddress: chain.bitbadgesAddress,
        toAddress: 'bb14d0y596ujj7s40n7nxu86qg4c835p3xay35twv',
        amount: [{ denom: 'badge', amount: '1' }]
      })
    }
  ]);

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
          creator: chain.bitbadgesAddress,
          collectionId: '1',
          creatorOverride: ''
        })
      },
      {
        type: 'MsgSend',
        msg: new MsgSend({
          fromAddress: chain.bitbadgesAddress,
          toAddress: 'bb14d0y596ujj7s40n7nxu86qg4c835p3xay35twv',
          amount: [{ denom: 'badge', amount: '1' }]
        })
      }
    ]);
  }, [chain.bitbadgesAddress]);

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

    return () => {
      window.removeEventListener('message', handleChildWindowMessage);
    };
  }, []);

  return (
    <>
      <StyledButton
        className="text-xs"
        disabled={loading || !chain.connected}
        onClick={async () => {
          const url = `https://bitbadges.io/dev/broadcast?txsInfo=${encodeURIComponent(JSON.stringify(txsInfo))}&autoPopulateCreator=${autoPopulateCreator}&userMode=${userMode}`;

          const openedWindow = window.open(url, '_blank');

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
        }}>
        Sign BitBadges Txn (Outsourced) {loading && <Spin />}
      </StyledButton>
    </>
  );
};
