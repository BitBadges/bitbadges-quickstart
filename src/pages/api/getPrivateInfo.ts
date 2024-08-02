import { getChainForAddress } from 'bitbadgesjs-sdk';
import { NextApiRequest, NextApiResponse } from 'next';

// Gets a secret user value if the user is signed in. This can be used for gated content.
const getPrivateInfo = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = req.cookies.session;
    if (!session) {
      return res.status(401).json({ message: 'You must be signed in to access this.' });
    }

    const sessionDetails = JSON.parse(session);
    return res.status(200).json({
      message:
        'The secret is: super secret password. This is only available to authenticated users. Currently authenticated user is: ' +
        getChainForAddress(sessionDetails.address) +
        ' address ' +
        sessionDetails.address
    });
  } catch (err) {
    return res.status(400).json({ message: `${err}` });
  }
};

export default getPrivateInfo;
