import { Balance, GO_MAX_UINT_64, OffChainBalancesMap, convertToCosmosAddress } from 'bitbadgesjs-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../db';

if (!db.get('balances')) {
  db.set('balances', {
    cosmos1mrdxhunfvjhe6lhdncp72dq46da2jcz9d9sh93: [
      new Balance({
        amount: 1n,
        badgeIds: [{ start: 1n, end: 1n }],
        ownershipTimes: [{ start: 1n, end: GO_MAX_UINT_64 }]
      })
    ]
  });
}

const getBalancesNonIndexed = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const balances: OffChainBalancesMap<bigint> = await db.get('balances');

    const balancesForUser = balances[convertToCosmosAddress(_req.query.address as string)];
    if (!balancesForUser) {
      return res.status(200).json({ balances: [] });
    } else {
      return res.status(200).json({ balances: balancesForUser });
    }
  } catch (err) {
    return res.status(400).json({ message: `${err}` });
  }
};

export default getBalancesNonIndexed;
