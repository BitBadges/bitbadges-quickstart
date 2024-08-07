import { useWeb3Modal } from '@web3modal/wagmi/react';

import { notification } from 'antd';
import { TransactionPayload, TxContext, convertToCosmosAddress, createTxBroadcastBody } from 'bitbadgesjs-sdk';
import { createContext, useContext, useEffect, useState } from 'react';
import { useDisconnect, useSignMessage, useAccount as useWeb3Account } from 'wagmi';
import { useAccount } from '../AccountsContext';
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
  const cosmosAddress = convertToCosmosAddress(address);
  const account = useAccount(cosmosAddress);
  const { signMessageAsync } = useSignMessage();

  useEffect(() => {
    setAddress(web3AccountContext.address || '');
  }, [web3AccountContext]);

  const { disconnect: disconnectWeb3 } = useDisconnect();

  const autoConnect = async () => {};

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
    await disconnectWeb3();
  };

  const signMessage = async (message: string) => {
    if (!account) throw new Error('Account not found.');

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
    if (!account) throw new Error('Account not found.');

    let sig = '';
    if (!simulate) {
      const message = payload.txnString;
      sig = await signMessageAsync({
        message: message
      });
    }

    const txBody = createTxBroadcastBody(context, messages, sig);
    return txBody;
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
