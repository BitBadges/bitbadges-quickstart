import { NextApiRequest, NextApiResponse } from "next";

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

    return res.status(200).json({
      chain: details.chain,
      address: details.address,
      signedIn: true,
      message: 'Successfully signed in',

      //For siwbb, we return the flag
      siwbb: details.siwbb,

      //For Web2, we also return the mapped username and public key because it is needed
      username: details.username,
      publicKey: details.publicKey
    });
  } catch (err) {
    return res.status(401).json({ signedIn: false, message: `${err}` });
  }
};

export default checkSignIn;
