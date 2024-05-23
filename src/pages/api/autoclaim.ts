import { NextApiRequest, NextApiResponse } from 'next';
import { BitBadgesApi } from './bitbadges-api';

const handleApiCallback = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const claimId = ''; //TODO: Your claim ID here
    const cosmosAddress = ''; //TODO: Your Cosmos address here

    const claimRes = await BitBadgesApi.completeClaim(claimId, cosmosAddress, req.body);
    const { txId } = claimRes;

    //TODO: Handle the transaction ID as needed. It may take a couple of seconds to be processed.
    const status = await BitBadgesApi.getClaimAttemptStatus(txId);
    console.log(status);

    return res.status(200).json({});
  } catch (err) {
    return res.status(401).json({});
  }
};

export default handleApiCallback;
