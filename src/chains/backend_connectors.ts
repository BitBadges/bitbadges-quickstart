import { EIP712TypedData, iBalance, iSecretsProof } from 'bitbadgesjs-sdk';
import { VerifyChallengeOptions } from 'blockin';

const fetchFromApi = async (path: string, body?: object | string | undefined, method: string = 'post') => {
  return fetch(path, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers: { 'Content-Type': 'application/json' }
  }).then((res) => res.json());
};

export const signIn = async (
  message: string,
  sig: string,
  sessionDetails: {
    username?: string;
    password?: string;
    siwbb?: boolean;
  },
  options?: VerifyChallengeOptions,
  secretsProofs?: iSecretsProof<bigint>[],
  publicKey?: string
): Promise<{
  success: true;
  errorMessage?: string;
}> => {
  console.log('signIn', message, sig, sessionDetails, options, secretsProofs, publicKey);
  return await fetchFromApi('../api/signIn', {
    ...sessionDetails,
    message: message,
    signature: sig,
    options,
    publicKey,
    secretsProofs
  });
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

export const signWithWeb2 = async (
  username: string,
  password: string,
  message: string,
  eipToSign?: EIP712TypedData
): Promise<any> => {
  return await fetchFromApi('../api/web2/signWithWeb2', { username, password, message, eipToSign });
};

export const createWeb2Account = async (username: string, password: string): Promise<any> => {
  return await fetchFromApi('../api/web2/createWeb2Account', { username, password });
};

// Im not calling this function anywhere. Its a redirect only
// export const discordVerify = async (code: string): Promise<any> => {
//   const verificationRes = await fetch('../api/integrations/discordVerify?' + new URLSearchParams({ code }), {
//     method: 'post',
//     body: '',
//     headers: { 'Content-Type': 'application/json' }
//   }).then(res => res.json());

//   return verificationRes;
// }
