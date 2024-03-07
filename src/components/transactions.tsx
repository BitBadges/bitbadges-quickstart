//Signs a transaction in-site.
//This is only applicable if you have users connect wallets to your site

import { useAccount } from '@/chains/chain_contexts/AccountsContext';
import { useChainContext } from '@/chains/chain_contexts/ChainContext';
import { useWeb2Context } from '@/chains/chain_contexts/web2/Web2Context';
import { Spin } from 'antd';
import { BETANET_CHAIN_DETAILS, TxContext, createTransactionPayload, proto } from 'bitbadgesjs-sdk';
import { useEffect, useMemo, useState } from 'react';
import { BitBadgesApi } from '../pages/api/bitbadges-api';

const MsgCreateProtocol = proto.protocols.MsgCreateProtocol;
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
  const web2Context = useWeb2Context();

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
        pubkey: signedInAccount?.publicKey ?? web2Context.publicKey
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
  }, [chain, signedInAccount, web2Context.publicKey]);

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
            const pubKey = await chain.getPublicKey(chain.cosmosAddress);
            txDetails.sender.pubkey = pubKey;
          }

          const protoMsgs = [
            // new ProtoMsgDeleteCollection({ collectionId: "1", creator: chain.cosmosAddress })
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

          //Note that the transaction may not be confirmed right away
          //You can use the tx hash to check the status of the transaction

          //Forcefully update the account info (fetch new sequence and info)

          await signedInAccount?.fetchAndUpdate(BitBadgesApi, { fetchBalance: true, fetchSequence: true }, true);
        }}>
        Sign Transaction
      </button>
    </>
  );
};

//Broadcast popup helper tool button. Outsource the transaction signing to a popup window.
//Note users can also manually sign through the official BitBadges frontend as well
//https://docs.bitbadges.io/for-developers/create-and-broadcast-txs/sign-+-broadcast-bitbadges.io
export const BroadcastTxPopupButton = ({ signInMethodTab }: { signInMethodTab: string }) => {
  const [loading, setLoading] = useState(false);
  const chain = useChainContext();

  //https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage
  const FRONTEND_URL = 'https://bitbadges.io';
  const handleChildWindowMessage = async (event: MessageEvent) => {
    if (event.source && event.origin === FRONTEND_URL) {
      // const txHash = event.data.txHash;
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
          const msgCreateProtocol = new MsgCreateProtocol({
            name: 'Test',
            uri: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
            customData: 'Test',
            isFrozen: false,
            creator: chain.cosmosAddress
          });
          const url =
            'https://bitbadges.io/dev/broadcast?txsInfo=[{ "type": "MsgCreateProtocol", "msg": ' +
            msgCreateProtocol.toJsonString() +
            ' }]';
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
        }}>
        Sign Transaction (Popup) {loading && <Spin />}
      </button>
    </>
  );
};
