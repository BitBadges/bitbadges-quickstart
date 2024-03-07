import { BigIntify, BitBadgesAPI } from 'bitbadgesjs-sdk';

const BACKEND_URL = process.env.BITBADGES_API_URL ?? 'https://api.bitbadges.io';
const API_KEY = process.env.BITBADGES_API_KEY ?? '';

export type DesiredNumberType = bigint;
export const ConvertFunction = BigIntify;

export const BitBadgesApi = new BitBadgesAPI({
  apiUrl: BACKEND_URL,
  apiKey: API_KEY,
  convertFunction: BigIntify
});
