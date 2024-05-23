import { OffChainBalancesMap, convertToCosmosAddress } from 'bitbadgesjs-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../db';

const setBalances = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { balances, address } = req.body;
    const cosmosAddress = convertToCosmosAddress(address);

    if (!db.get('balances')) {
      db.set('balances', {});
    }
    const balancesMap = (await db.get('balances')) as OffChainBalancesMap<string>;
    balancesMap[cosmosAddress] = balances;
    await db.set('balances', balancesMap);

    console.log(balancesMap);

    return res.status(200).json({ balances });
  } catch (err) {
    return res.status(400).json({ message: `${err}` });
  }
};

export default setBalances;
