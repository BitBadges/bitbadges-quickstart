import { useWeb3Modal } from '@web3modal/wagmi/react';

import { notification } from 'antd';
import { TransactionPayload, TxContext, createTxBroadcastBody } from 'bitbadgesjs-sdk';
import { createContext, useContext, useEffect, useState } from 'react';
import { useDisconnect, useSignMessage, useAccount as useWeb3Account } from 'wagmi';
import { BaseDefaultChainContext, ChainSpecificContextType } from '../utils';

export type EthereumContextType = ChainSpecificContextType & {};

export const EthereumContext = createContext<EthereumContextType>({
  ...BaseDefaultChainContext
});

type Props = {
  children?: React.ReactNode;
};

export const EthereumContextProvider: React.FC<Props> = ({ children }) => {
  const { open } = useWeb3Modal();
  const web3AccountContext = useWeb3Account();
  const [address, setAddress] = useState<string>('');
  const { signMessageAsync } = useSignMessage();

  useEffect(() => {
    setAddress(web3AccountContext.address || '');
  }, [web3AccountContext]);

  const { disconnect: disconnectWeb3 } = useDisconnect();

  const autoConnect = async () => {}; // Should already auto connect
  const connect = async () => {
    if (!address) {
      try {
        await open();
      } catch (e) {
        notification.error({
          message: 'Error connecting to wallet',
          description:
            'Make sure you have a compatible Ethereum wallet installed (such as MetaMask) and that you are signed in to it.'
        });
      }
    }
  };

  const disconnect = async () => {
    disconnectWeb3();
  };

  const signMessage = async (message: string) => {
    const sign = await signMessageAsync({
      message: message
    });

    return {
      message,
      signature: sign
    };
  };

  const signBitBadgesTxn = async (
    context: TxContext,
    payload: TransactionPayload,
    messages: any[],
    simulate: boolean
  ) => {
    const message = payload.txnString;
    let sig = '';
    if (!simulate) {
      sig = await signMessageAsync({
        message: message
      });
    }

    return createTxBroadcastBody(context, messages, sig);
  };

  const ethereumContext: EthereumContextType = {
    connect,
    disconnect,
    autoConnect,
    signMessage,
    signBitBadgesTxn,
    address
  };

  return <EthereumContext.Provider value={ethereumContext}>{children}</EthereumContext.Provider>;
};

export const useEthereumContext = () => useContext(EthereumContext);
