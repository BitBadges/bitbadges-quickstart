import { BigIntify, BitBadgesAPI } from 'bitbadgesjs-sdk';
import getConfig from 'next/config';

export type DesiredNumberType = bigint;
export const ConvertFunction = BigIntify;

// This is the API access point for your frontend.
// Note that you can call from the frontend, but the API key is exposed to the user.
const { publicRuntimeConfig } = getConfig();
const BACKEND_URL = publicRuntimeConfig.BITBADGES_API_URL ?? 'https://api.bitbadges.io';
const API_KEY = publicRuntimeConfig.BITBADGES_API_KEY ?? '';

export const BitBadgesApi = new BitBadgesAPI({
  apiUrl: BACKEND_URL,
  convertFunction: BigIntify,
  apiKey: API_KEY
});
