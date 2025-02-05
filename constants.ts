import { BETANET_CHAIN_DETAILS, SupportedChain, TESTNET_CHAIN_DETAILS } from 'bitbadgesjs-sdk';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();
export const HOSTNAME = publicRuntimeConfig.HOSTNAME;
export const BACKEND_PORT = publicRuntimeConfig.BACKEND_PORT;

export const TESTNET = publicRuntimeConfig.TESTNET;
export const CHAIN_DETAILS = publicRuntimeConfig.TESTNET_MODE ? TESTNET_CHAIN_DETAILS : BETANET_CHAIN_DETAILS;

export const NODE_PORT = '1317';
export const NODE_API_URL = `${HOSTNAME !== 'localhost' ? (TESTNET ? 'https://testnet.node.bitbadges.io/api' : 'https://node.bitbadges.io' + '/api') : 'http://localhost:1317'}`;
export const RPC_PORT = '26657';
export const RPC_URL = `${HOSTNAME !== 'localhost' ? (TESTNET ? 'https://testnet.node.bitbadges.io/rpc' : 'https://node.bitbadges.io' + '/rpc') : 'http://localhost:26657'}`;

export const BACKEND_URL = `https://${HOSTNAME !== 'localhost' ? 'api.' + HOSTNAME : HOSTNAME}${BACKEND_PORT}${TESTNET && HOSTNAME !== 'localhost' ? '/testnet' : ''}`;
export const WEBSITE_HOSTNAME = `https://${HOSTNAME}`;

export const ETH_LOGO = '/images/ethereum-logo.png';
export const COSMOS_LOGO = '/images/bitbadgeslogo.png';
export const BITCOIN_LOGO = '/images/bitcoin-logo.png';
export const SOLANA_LOGO = '/images/solana-logo.png';
export const CHAIN_LOGO = '/images/encryption-icon.svg';

export function getChainLogo(chain: string) {
  let chainLogo = '';

  switch (chain) {
    case SupportedChain.ETH:
      chainLogo = ETH_LOGO;
      break;
    case SupportedChain.UNKNOWN:
      chainLogo =
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Blue_question_mark_icon.svg/1024px-Blue_question_mark_icon.svg.png';
      break;
    case SupportedChain.COSMOS:
      chainLogo = COSMOS_LOGO;
      break;
    case SupportedChain.SOLANA:
      chainLogo = SOLANA_LOGO;
      break;
    case SupportedChain.BTC:
      chainLogo = BITCOIN_LOGO;
      break;
    default:
      chainLogo = ETH_LOGO;
      break;
  }

  return chainLogo;
}
