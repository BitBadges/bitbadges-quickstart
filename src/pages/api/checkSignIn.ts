import { BlockinChallengeParams, getChainForAddress } from 'bitbadgesjs-sdk';
import { NextApiRequest, NextApiResponse } from 'next';

// For all authentication attempts, we will check the session cookie to see if the user is signed in
// The session cookie consists of the chain / address of the user signed in.
const checkSignIn = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    //Check the cookie
    const session = req.cookies.session;
    if (!session) {
      return res.status(401).json({ signedIn: false, message: 'You are not signed in.' });
    }

    const details = JSON.parse(session);
    const params = new BlockinChallengeParams(details.params);

    return res.status(200).json({
      chain: getChainForAddress(params.address),
      address: params.address,
      signedIn: true,
      message: 'Successfully signed in',

      //For siwbb, we return the flag
      siwbb: details.siwbb
    });
  } catch (err) {
    return res.status(401).json({ signedIn: false, message: `${err}` });
  }
};

export default checkSignIn;
