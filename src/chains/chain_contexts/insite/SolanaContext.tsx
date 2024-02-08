
import { checkSignIn } from '@/chains/backend_connectors';
import { useAccount } from '@/redux/accounts/AccountsContext';
import { notification } from 'antd';
import { TransactionPayload, TxContext, createTxBroadcastBodySolana } from 'bitbadgesjs-proto';
import { convertToCosmosAddress, solanaToCosmos } from 'bitbadgesjs-utils';
import { Dispatch, SetStateAction, createContext, useCallback, useContext, useState } from 'react';
import { useCookies } from 'react-cookie';
import { ChainSpecificContextType } from '../ChainContext';
import { BaseDefaultChainContext } from '@/chains/utils';

const bs58 = require('bs58');


export type SolanaContextType = ChainSpecificContextType & {
  solanaProvider: any;
  setSolanaProvider: Dispatch<SetStateAction<any | undefined>>;
}

export const SolanaContext = createContext<SolanaContextType>({
  ...BaseDefaultChainContext,
  solanaProvider: undefined,
  setSolanaProvider: () => { },
})

type Props = {
  children?: React.ReactNode
};

export const SolanaContextProvider: React.FC<Props> = ({ children }) => {
  const [cookies, setCookies] = useCookies(['blockincookie', 'pub_key']);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [solanaProvider, setSolanaProvider] = useState<any>();
  const [pubKey, setPubKey] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const cosmosAddress = convertToCosmosAddress(address);
  const connected = address ? true : false;
  const setConnected = () => { }
  const account = useAccount(cosmosAddress)

  const getProvider = () => {
    if ('phantom' in window) {
      const phantomWindow = window as any;
      const provider = phantomWindow.phantom?.solana;
      setSolanaProvider(provider);
      if (provider?.isPhantom) {
        return provider;
      }

      window.open('https://phantom.app/', '_blank');
    }
  };

  const connect = async () => {
    await connectAndPopulate(address ?? '', cookies.blockincookie);
  }

  const connectAndPopulate = useCallback(async (address: string, cookie: string) => {
    if (!address) {
      try {
        const provider = getProvider(); // see "Detecting the Provider"

        const resp = await provider.request({ method: "connect" });
        const address = resp.publicKey.toBase58();
        const pubKey = resp.publicKey.toBase58();
        const cosmosAddress = solanaToCosmos(address);

        setSolanaProvider(provider);
        setAddress(address);

        const solanaPublicKeyBase58 = pubKey;
        const solanaPublicKeyBuffer = bs58.decode(solanaPublicKeyBase58);
        const publicKeyToSet = Buffer.from(solanaPublicKeyBuffer).toString('base64')
        setPubKey(publicKeyToSet);
        setCookies('pub_key', `${cosmosAddress}-${publicKeyToSet}`, { path: '/' });

        if (cookie === convertToCosmosAddress(address)) {
          const signedInRes = await checkSignIn();
          setLoggedIn(signedInRes.signedIn);
        } else {
          setLoggedIn(false);
        }
      } catch (e) {
        console.error(e);
        notification.error({
          message: 'Error connecting to wallet',
          description: 'Make sure you have Phantom installed and are logged in.',
        })
      }
    }
  }, [setCookies]);


  const disconnect = async () => {
    setLoggedIn(false);
    setAddress('');
    await solanaProvider?.request({ method: "disconnect" });
  };

  const signChallenge = async (message: string) => {
    const encodedMessage = new TextEncoder().encode(message);
    const provider = solanaProvider;
    const signedMessage = await provider.request({
      method: "signMessage",
      params: {
        message: encodedMessage,
        display: "utf8",
      },
    });

    return { message: message, signature: signedMessage.signature.toString('hex') };
  }

  const signTxn = async (context: TxContext, payload: TransactionPayload, simulate: boolean) => {
    if (!account) throw new Error('Account not found.');

    let sig = '';
    if (!simulate) {
      const message = payload.jsonToSign;
      const encodedMessage = new TextEncoder().encode(message);
      const signedMessage = await solanaProvider.request({
        method: "signMessage",
        params: {
          message: encodedMessage,
          display: "utf8",
        },
      });
      sig = signedMessage.signature.toString('hex');
    }

    const txBody = createTxBroadcastBodySolana(context, payload, sig, address);
    return txBody;
  }

  const getPublicKey = async (_cosmosAddress: string) => {
    return pubKey;
  }

  const solanaContext: SolanaContextType = {
    connected,
    setConnected,
    connect,
    disconnect,
    signChallenge,
    signTxn,
    address,
    setSolanaProvider,
    solanaProvider,
    getPublicKey,
    loggedIn,
    setLoggedIn,
  };


  return <SolanaContext.Provider value={solanaContext}>
    {children}
  </SolanaContext.Provider>
}

export const useSolanaContext = () => useContext(SolanaContext)  