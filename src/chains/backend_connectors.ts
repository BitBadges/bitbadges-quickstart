import { BigIntify, EIP712TypedData } from "bitbadgesjs-sdk";
import { getChainForAddress } from "bitbadgesjs-sdk";
import { VerifyChallengeOptions, constructChallengeObjectFromString } from "blockin";

export const signIn = async (message: string, sig: string, sessionDetails: {
  username?: string,
  password?: string
  siwbb?: boolean
}, options?: VerifyChallengeOptions, publicKey?: string): Promise<{
  success: true;
  errorMessage?: string;
}> => {
  const chain = getChainForAddress(constructChallengeObjectFromString(message, BigIntify).address);
  const verificationRes = await fetch('../api/signIn', {
    method: 'post',
    body: JSON.stringify({ ...sessionDetails, message: message, signature: sig, options, chain, publicKey }),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());

  return verificationRes;
}


export const getPrivateInfo = async (): Promise<any> => {
  const verificationRes = await fetch('../api/getPrivateInfo', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());

  return verificationRes;
}

export const signOut = async (): Promise<any> => {
  const verificationRes = await fetch('../api/signOut', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());

  return verificationRes;
}

export const checkSignIn = async (): Promise<any> => {
  const verificationRes = await fetch('../api/checkSignIn', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());

  return verificationRes;
}


export const getMetadata = async (): Promise<any> => {
  const verificationRes = await fetch('../api/selfHostMetadata', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());

  return verificationRes;
}

export const getBalancesIndexed = async (): Promise<any> => {
  const verificationRes = await fetch('../api/selfHostBalancesIndexed', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());

  return verificationRes;
}

export const getBalancesNonIndexed = async (cosmosAddress: string): Promise<any> => {
  const verificationRes = await fetch('../api/selfHostBalancesNonIndexed', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cosmosAddress })
  }).then(res => res.json());

  return verificationRes;
}

export const signWithWeb2 = async (username: string, password: string, message: string, eipToSign?: EIP712TypedData): Promise<any> => {
  const verificationRes = await fetch('../api/web2/signWithWeb2', {
    method: 'post',
    body: JSON.stringify({ username, password, message, eipToSign }),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());

  return verificationRes;
}

export const createWeb2Account = async (username: string, password: string): Promise<any> => {
  const verificationRes = await fetch('../api/web2/createWeb2Account', {
    method: 'post',
    body: JSON.stringify({ username, password }),
    headers: { 'Content-Type': 'application/json' }
  }).then(res => res.json());

  return verificationRes;
}

// Im not calling this function anywhere. Its a redirect only
// export const discordVerify = async (code: string): Promise<any> => {
//   const verificationRes = await fetch('../api/discordVerify?' + new URLSearchParams({ code }), {
//     method: 'post',
//     body: '',
//     headers: { 'Content-Type': 'application/json' }
//   }).then(res => res.json());

//   return verificationRes;
// }