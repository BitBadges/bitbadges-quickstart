import { iBalance } from 'bitbadgesjs-sdk';
import { VerifyChallengeOptions } from 'blockin/dist/types/verify.types';

const fetchFromApi = async (path: string, body?: object | string | undefined, method: string = 'post') => {
  return fetch(path, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' }
  }).then((res) => {
    if (res.ok) {
      return res.json();
    }
    throw new Error('Failed to fetch');
  });
};

export const signInManual = async (
  message: string,
  sig: string,
  options?: VerifyChallengeOptions,
  publicKey?: string
): Promise<{
  success: true;
  errorMessage?: string;
}> => {
  return await fetchFromApi('../api/signInManual', {
    message: message,
    signature: sig,
    options,
    publicKey
  });
};

export const signIn = async (
  authCode: string
): Promise<{
  success: true;
  errorMessage?: string;
}> => {
  return await fetchFromApi('../api/signIn?' + new URLSearchParams({ code: authCode }), undefined, 'post');
};

export const getPrivateInfo = async (): Promise<any> => {
  return await fetchFromApi('../api/getPrivateInfo');
};

export const checkSignIn = async (): Promise<any> => {
  return await fetchFromApi('../api/checkSignIn');
};

export const signOut = async (): Promise<any> => {
  return await fetchFromApi('../api/signOut');
};

export const getBalancesIndexed = async (): Promise<any> => {
  return await fetchFromApi('../api/selfhost/balancesIndexed', undefined, 'get');
};

export const getBalancesNonIndexed = async (address: string): Promise<any> => {
  return await fetchFromApi('../api/selfhost/balancesNonIndexed?' + new URLSearchParams({ address }), undefined, 'get');
};

export const setBalances = async (address: string, balances: iBalance<bigint>[]): Promise<any> => {
  return await fetchFromApi('../api/selfhost/setBalances', { address, balances });
};
