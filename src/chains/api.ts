import {
  BigIntify, BitBadgesAPI
} from 'bitbadgesjs-utils';
import getConfig from 'next/config';

export type DesiredNumberType = bigint;
export const ConvertFunction = BigIntify;

const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = publicRuntimeConfig.BITBADGES_API_URL ?? 'https://api.bitbadges.io'
const API_KEY = publicRuntimeConfig.BITBADGES_API_KEY ?? '';

export const BitBadgesApi = new BitBadgesAPI({
  apiUrl: BACKEND_URL,
  convertFunction: BigIntify,
  apiKey: API_KEY,
});
