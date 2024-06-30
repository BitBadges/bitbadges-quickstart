import CryptoJS from 'crypto-js';
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from './db';

if (!db.get('claim-count')) {
  db.set('claim-count', 0);
}

const seedCode = '123456'; //TODO: Add yours from the claim
const totalNumCodes = 10000; //TODO: Add yours from the claim

const { SHA256 } = CryptoJS;
export const generateCodesFromSeed = (seedCode: string, numCodes: number): string[] => {
  let currCode = seedCode;
  const codes = [];
  for (let i = 0; i < numCodes; i++) {
    currCode = SHA256(currCode + seedCode).toString();
    codes.push(currCode);
  }
  return codes;
};

const checkClaimCriteria = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    //TODO: Check your criteria here

    //Note this is just a simple example and assumes the get and set are atomic operations.
    const currCount = await db.get('claim-count');
    if (currCount >= totalNumCodes) {
      return res.status(401).json({ message: 'All codes have been claimed' });
    }
    db.set('claim-count', Number(currCount) + 1);

    const codes = generateCodesFromSeed(seedCode, totalNumCodes);
    const code = codes[Number(currCount)];

    return res.status(200).json({ code });
  } catch (err) {
    return res.status(401).json({ signedIn: false, message: `${err}` });
  }
};

export default checkClaimCriteria;
