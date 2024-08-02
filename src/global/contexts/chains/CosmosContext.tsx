import { BaseDefaultChainContext } from '../utils';
import { AccountData, Window as KeplrWindow } from '@keplr-wallet/types';
import {
  BitBadgesKeplrSuggestBetanetChainInfo,
  TransactionPayload,
  TxContext,
  createTxBroadcastBody
} from 'bitbadgesjs-sdk';
import Long from 'long';
import { createContext, useContext, useState } from 'react';
import { CHAIN_DETAILS } from '../../../../constants';
import { ChainSpecificContextType } from '../utils';
import { notification } from 'antd';

declare global {
  interface Window extends KeplrWindow {}
}

export type CosmosContextType = ChainSpecificContextType & {};

export const CosmosContext = createContext<CosmosContextType>({
  ...BaseDefaultChainContext
});

type Props = {
  children?: React.ReactNode;
};

export const CosmosContextProvider: React.FC<Props> = ({ children }) => {
  const chainId = CHAIN_DETAILS.cosmosChainId;

  const [address, setAddress] = useState<string>('');
  const cosmosAddress = address;

  const autoConnect = async () => {
    await connect(true);
  };

  const connect = async (auto = false) => {
    try {
      const { keplr } = window;
      if (!keplr || !window || !window.getOfflineSigner) {
        throw new Error('Please install Keplr to continue with Cosmos');
      }

      await keplr.experimentalSuggestChain(BitBadgesKeplrSuggestBetanetChainInfo);
      const offlineSigner = window.getOfflineSigner(chainId);
      const account: AccountData = (await offlineSigner.getAccounts())[0];
      setAddress(account.address);
    } catch (e) {
      if (auto) return;
      console.error(e);
      notification.error({
        message: 'Error connecting to wallet',
        description: 'Make sure you have Keplr installed and are logged in.'
      });
    }
  };

  const disconnect = async () => {
    setAddress('');
  };

  const signMessage = async (message: string) => {
    let sig = await window.keplr?.signArbitrary('bitbadges_1-1', cosmosAddress, message);

    if (!sig) sig = { signature: '', pub_key: { type: '', value: '' } };

    return {
      message: message,
      signature: sig.signature,
      publicKey: sig.pub_key.value
    };
  };

  const signBitBadgesTxn = async (context: TxContext, payload: TransactionPayload, simulate: boolean) => {
    const { sender } = context;
    await window.keplr?.enable(chainId);

    let signatures = [new Uint8Array(Buffer.from('0x', 'hex'))];
    if (!simulate) {
      const signResponse = await window?.keplr?.signDirect(
        chainId,
        sender.accountAddress,
        {
          bodyBytes: payload.signDirect.body.toBinary(),
          authInfoBytes: payload.signDirect.authInfo.toBinary(),
          chainId: chainId,
          accountNumber: new Long(sender.accountNumber)
        },
        {
          preferNoSetFee: true
        }
      );

      if (!signResponse) {
        throw new Error('No signature returned from Keplr');
      }

      signatures = [new Uint8Array(Buffer.from(signResponse.signature.signature, 'base64'))];
    }

    const hexSig = Buffer.from(signatures[0]).toString('hex');
    const txBody = createTxBroadcastBody(context, payload, hexSig);
    return txBody;
  };

  const getPublicKey = async () => {
    const account = await window?.keplr?.getKey(chainId);
    if (!account) return '';

    return Buffer.from(account.pubKey).toString('base64');
  };

  const cosmosContext: CosmosContextType = {
    connect,
    disconnect,
    autoConnect,
    signMessage,
    signBitBadgesTxn,
    address,
    getPublicKey
  };

  return <CosmosContext.Provider value={cosmosContext}>{children}</CosmosContext.Provider>;
};

export const useCosmosContext = () => useContext(CosmosContext);
