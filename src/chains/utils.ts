import { SupportedChain } from "bitbadgesjs-proto"
import { ChainContextType } from "./chain_contexts/ChainContext"

export const BaseDefaultChainContext: ChainContextType = {
  address: '',
  connected: false,
  setConnected: () => { },
  loggedIn: false,
  cosmosAddress: '',
  setLoggedIn: () => { },
  connect: async () => { },
  disconnect: async () => { },
  signChallenge: async () => { return { message: '', signature: '' } },
  signTxn: async () => { return '' },
  getPublicKey: async () => { return '' },
  chain: SupportedChain.UNKNOWN,
  setChain: () => { },
}