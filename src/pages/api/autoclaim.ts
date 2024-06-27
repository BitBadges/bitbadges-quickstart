import { NextApiRequest, NextApiResponse } from 'next';
// import { BitBadgesApi } from './bitbadges-api';

const handleAutoClaim = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    //TODO: See here for documentation: https://docs.bitbadges.io/for-developers/claim-builder/auto-complete-claims-w-bitbadges-api

    // When creating your claim on the BitBadges site, go to the API Code tab, and you will see the API code for your claim.
    // Your BitBadgesApi instance is setup in the bitbadges-api.ts file, so you can use it here to make the API call.

    return res.status(200).json({});
  } catch (err) {
    return res.status(401).json({});
  }
};

export default handleAutoClaim;
