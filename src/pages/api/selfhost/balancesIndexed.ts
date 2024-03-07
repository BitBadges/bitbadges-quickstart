import { OffChainBalancesMap, GO_MAX_UINT_64, Balance } from 'bitbadgesjs-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../web2/db';

if (!db.get('balances')) {
  db.set('balances', {
    cosmos1example: [
      new Balance({
        amount: 1n,
        badgeIds: [{ start: 1n, end: 1n }],
        ownershipTimes: [{ start: 1n, end: GO_MAX_UINT_64 }]
      })
    ]
  });
}

const getBalancesIndexed = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const balances: OffChainBalancesMap<bigint> = await db.get('balances');
    return res.status(200).json({ balances });
  } catch (err) {
    return res.status(400).json({ message: `${err}` });
  }
};

export default getBalancesIndexed;
