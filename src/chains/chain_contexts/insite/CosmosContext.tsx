import { checkSignIn } from '@/chains/backend_connectors';
import { useAccount } from '@/redux/accounts/AccountsContext';
import { verifyADR36Amino } from '@keplr-wallet/cosmos';
import { AccountData, Window as KeplrWindow } from "@keplr-wallet/types";
import { BitBadgesKeplrSuggestBetanetChainInfo, TransactionPayload, TxContext, createTxBroadcastBodyCosmos } from 'bitbadgesjs-sdk';
import { convertToCosmosAddress } from 'bitbadgesjs-sdk';
import Long from 'long';
import { createContext, useContext, useEffect, useState } from 'react';
import { CHAIN_DETAILS } from '../../../../constants';
import { ChainSpecificContextType } from '../ChainContext';
import { BaseDefaultChainContext } from '@/chains/utils';

declare global {
  interface Window extends KeplrWindow { }
}

export type CosmosContextType = ChainSpecificContextType & {}

export const CosmosContext = createContext<CosmosContextType>({
  ...BaseDefaultChainContext,
})

type Props = {
  children?: React.ReactNode
};

export const CosmosContextProvider: React.FC<Props> = ({ children }) => {
  const chainId = CHAIN_DETAILS.cosmosChainId;

  const [address, setAddress] = useState<string>('')
  const [connected, setConnected] = useState<boolean>(false);
  const [cosmosAddress, setCosmosAddress] = useState<string>('');
  const [loggedIn, setLoggedIn] = useState<boolean>(false)
  const account = useAccount(address)

  useEffect(() => {
    async function fetchDetails() {
      if (address) {
        setAddress(address);
        setCosmosAddress(convertToCosmosAddress(address));
        const signedInRes = await checkSignIn();
        setLoggedIn(signedInRes.signedIn && signedInRes.address === address);
        setConnected(true);
      } else {
        setConnected(false);
      }
    }
    fetchDetails();
  }, [address, loggedIn])

  const connect = async () => {
    const { keplr } = window
    if (!keplr || !window || !window.getOfflineSigner) {
      alert("Please install Keplr to continue with Cosmos")
      return
    }

    await keplr.experimentalSuggestChain(BitBadgesKeplrSuggestBetanetChainInfo)
    const offlineSigner = window.getOfflineSigner(chainId);
    const account: AccountData = (await offlineSigner.getAccounts())[0]
    setConnected(true);
    setAddress(account.address);
  }

  const disconnect = async () => {
    setAddress('');
    setConnected(false);
  };

  const signChallenge = async (message: string) => {
    let sig = await window.keplr?.signArbitrary("bitbadges_1-2", cosmosAddress, message);

    if (!sig) sig = { signature: '', pub_key: { type: '', value: '' } };

    const signatureBuffer = Buffer.from(sig.signature, 'base64');
    const uint8Signature = new Uint8Array(signatureBuffer); // Convert the buffer to an Uint8Array
    const pubKeyValueBuffer = Buffer.from(sig.pub_key.value, 'base64'); // Decode the base64 encoded value
    const pubKeyUint8Array = new Uint8Array(pubKeyValueBuffer); // Convert the buffer to an Uint8Array

    const isRecovered = verifyADR36Amino('cosmos', cosmosAddress, message, pubKeyUint8Array, uint8Signature, 'secp256k1');
    if (!isRecovered) {
      throw new Error('Signature verification failed');
    }

    return {
      message: message,
      signature: sig.signature,
      publicKey: sig.pub_key.value,
    }
  }

  const signTxn = async (context: TxContext, payload: TransactionPayload, simulate: boolean) => {
    if (!account) {
      throw new Error('Account does not exist');
    }
    const { sender } = context;
    await window.keplr?.enable(chainId);

    let signatures = [
      new Uint8Array(Buffer.from('0x', 'hex')),
    ]
    if (!simulate) {
      const signResponse = await window?.keplr?.signDirect(
        chainId,
        sender.accountAddress,
        {
          bodyBytes: payload.signDirect.body.toBinary(),
          authInfoBytes: payload.signDirect.authInfo.toBinary(),
          chainId: chainId,
          accountNumber: new Long(sender.accountNumber),
        },
        {
          preferNoSetFee: true,
        }
      )

      if (!signResponse) {
        throw new Error('No signature returned from Keplr');
      }

      signatures = [
        new Uint8Array(Buffer.from(signResponse.signature.signature, 'base64')),
      ]
    }

    const txBody = createTxBroadcastBodyCosmos(payload, signatures);
    return txBody;
  }

  const getPublicKey = async (_cosmosAddress: string) => {
    const account = await window?.keplr?.getKey(chainId)
    if (!account) return '';

    const pk = Buffer.from(account.pubKey).toString('base64')
    return pk;
  }

  const cosmosContext: CosmosContextType = {
    connected,
    setConnected,
    connect,
    disconnect,
    signChallenge,
    signTxn,
    address,
    getPublicKey,
    loggedIn,
    setLoggedIn,
  };


  return <CosmosContext.Provider value={cosmosContext}>
    {children}
  </ CosmosContext.Provider>
}

export const useCosmosContext = () => useContext(CosmosContext)


