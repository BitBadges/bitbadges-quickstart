import { notification } from 'antd';
import { TransactionPayload, TxContext, convertToBitBadgesAddress, createTxBroadcastBody } from 'bitbadgesjs-sdk';
import { createContext, useContext, useState } from 'react';
import { useAccount } from '../AccountsContext';
import { BaseDefaultChainContext, ChainSpecificContextType } from '../utils';

export type SolanaContextType = ChainSpecificContextType;

export const SolanaContext = createContext<SolanaContextType>({
  ...BaseDefaultChainContext
});

type Props = {
  children?: React.ReactNode;
};

export const SolanaContextProvider: React.FC<Props> = ({ children }) => {
  const [address, setAddress] = useState<string>('');

  const bitbadgesAddress = convertToBitBadgesAddress(address);
  const account = useAccount(bitbadgesAddress);

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
        setAddress(address);
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

  const signBitBadgesTxn = async (
    context: TxContext,
    payload: TransactionPayload,
    messages: any[],
    simulate: boolean
  ) => {
    if (!account) throw new Error('Account not found.');

    let sig = '';
    if (!simulate) {
      let message = payload.txnString;
      const signedMessage = await getProvider().request({
        method: 'signMessage',
        params: {
          message: message,
          display: 'utf8'
        }
      });
      sig = signedMessage.signature.toString('hex');
    }

    //We need to pass in solAddress manually here
    const txBody = createTxBroadcastBody(context, messages, sig, address);
    return txBody;
  };

  const solanaContext: SolanaContextType = {
    connect,
    autoConnect,
    disconnect,
    signMessage,
    signBitBadgesTxn,
    address
  };

  return <SolanaContext.Provider value={solanaContext}>{children}</SolanaContext.Provider>;
};

export const useSolanaContext = () => useContext(SolanaContext);
