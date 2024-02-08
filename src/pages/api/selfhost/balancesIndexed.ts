import { OffChainBalancesMap, GO_MAX_UINT_64 } from "bitbadgesjs-sdk";
import { NextApiRequest, NextApiResponse } from "next";

const getBalancesIndexed = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const balances: OffChainBalancesMap<bigint> = {
      "cosmos1example": [{ amount: 1n, badgeIds: [{ start: 1n, end: 1n }], ownershipTimes: [{ start: 1n, end: GO_MAX_UINT_64 }] }],
    }

    return res.status(200).json({ balances });
  } catch (err) {
    return res.status(400).json({ message: `${err}` });
  }
};

export default getBalancesIndexed;
