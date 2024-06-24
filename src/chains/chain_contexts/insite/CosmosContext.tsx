import { BaseDefaultChainContext } from '@/chains/utils';
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
import { ChainSpecificContextType } from '../ChainContext';

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

  const connect = async () => {
    const { keplr } = window;
    if (!keplr || !window || !window.getOfflineSigner) {
      alert('Please install Keplr to continue with Cosmos');
      return;
    }

    await keplr.experimentalSuggestChain(BitBadgesKeplrSuggestBetanetChainInfo);
    const offlineSigner = window.getOfflineSigner(chainId);
    const account: AccountData = (await offlineSigner.getAccounts())[0];
    setAddress(account.address);
  };

  const disconnect = async () => {
    setAddress('');
  };

  const signChallenge = async (message: string) => {
    let sig = await window.keplr?.signArbitrary('bitbadges_1-2', cosmosAddress, message);

    if (!sig) sig = { signature: '', pub_key: { type: '', value: '' } };

    return {
      message: message,
      signature: sig.signature,
      publicKey: sig.pub_key.value
    };
  };

  const signTxn = async (context: TxContext, payload: TransactionPayload, simulate: boolean) => {
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
    signChallenge,
    signTxn,
    address,
    getPublicKey
  };

  return <CosmosContext.Provider value={cosmosContext}>{children}</CosmosContext.Provider>;
};

export const useCosmosContext = () => useContext(CosmosContext);
