import { BaseDefaultChainContext } from '../utils';
import { notification } from 'antd';
import { TransactionPayload, TxContext, convertToCosmosAddress, createTxBroadcastBody } from 'bitbadgesjs-sdk';
import { createContext, useContext, useState } from 'react';
import { useAccount } from '../AccountsContext';
import { ChainSpecificContextType } from '../utils';

const bs58 = require('bs58');

export type SolanaContextType = ChainSpecificContextType;

export const SolanaContext = createContext<SolanaContextType>({
  ...BaseDefaultChainContext
});

type Props = {
  children?: React.ReactNode;
};

export const SolanaContextProvider: React.FC<Props> = ({ children }) => {
  const [pubKey, setPubKey] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const cosmosAddress = convertToCosmosAddress(address);
  const account = useAccount(cosmosAddress);

  const getProvider = () => {
    if ('phantom' in window) {
      const phantomWindow = window as any;
      const provider = phantomWindow.phantom?.solana;
      if (provider?.isPhantom) {
        return provider;
      }

      window.open('https://phantom.app/', '_blank');
    }
  };

  const autoConnect = async () => {
    await connect(true);
  };

  const connect = async (auto = false) => {
    if (!address) {
      try {
        const provider = getProvider(); // see "Detecting the Provider"

        const resp = await provider.request({ method: 'connect' });
        const address = resp.publicKey.toBase58();
        const pubKey = resp.publicKey.toBase58();
        setAddress(address);

        const solanaPublicKeyBase58 = pubKey;
        const solanaPublicKeyBuffer = bs58.decode(solanaPublicKeyBase58);
        const publicKeyToSet = Buffer.from(solanaPublicKeyBuffer).toString('base64');
        setPubKey(publicKeyToSet);
      } catch (e) {
        if (auto) return;
        console.error(e);
        notification.error({
          message: 'Error connecting to wallet',
          description: 'Make sure you have Phantom installed and are logged in.'
        });
      }
    }
  };

  const disconnect = async () => {
    setAddress('');
    await getProvider()?.request({ method: 'disconnect' });
  };

  const signMessage = async (message: string) => {
    const encodedMessage = new TextEncoder().encode(message);
    const provider = getProvider();
    const signedMessage = await provider.request({
      method: 'signMessage',
      params: {
        message: encodedMessage,
        display: 'utf8'
      }
    });

    return { message: message, signature: signedMessage.signature.toString('hex') };
  };

  const signBitBadgesTxn = async (context: TxContext, payload: TransactionPayload, simulate: boolean) => {
    if (!account) throw new Error('Account not found.');

    let sig = '';
    if (!simulate) {
      const normalMessage = false;
      let message = payload.jsonToSign;
      let encodedMessage = new TextEncoder().encode(message);

      if (!normalMessage) {
        encodedMessage = new TextEncoder().encode(payload.humanReadableMessage);
      }

      const signedMessage = await getProvider().request({
        method: 'signMessage',
        params: {
          message: encodedMessage,
          display: 'utf8'
        }
      });
      sig = signedMessage.signature.toString('hex');
    }

    //We need to pass in solAddress manually here
    const txBody = createTxBroadcastBody(context, payload, sig, address);
    return txBody;
  };

  const getPublicKey = async () => {
    return pubKey;
  };

  const solanaContext: SolanaContextType = {
    connect,
    autoConnect,
    disconnect,
    signMessage,
    signBitBadgesTxn,
    address,
    getPublicKey
  };

  return <SolanaContext.Provider value={solanaContext}>{children}</SolanaContext.Provider>;
};

export const useSolanaContext = () => useContext(SolanaContext);