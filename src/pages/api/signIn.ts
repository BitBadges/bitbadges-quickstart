import { VerifySIWBBOptions } from 'bitbadgesjs-sdk';
import cookie from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';
import { BitBadgesApi } from './bitbadges-api';

const CLIENT_ID = process.env.CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.CLIENT_SECRET ?? '';
const REDIRECT_URI = process.env.REDIRECT_URI ?? '';

//This will sign the user in to your backend. This is just an example and should be replaced with your own logic.
//This example uses session cookies to store the user's session.
const signIn = async (req: NextApiRequest, res: NextApiResponse) => {
  const code = req.query.code as string;
  // const state = req.query.state as string; // (if applicable, state can be passed via the redirect from the original sign-in request)

  try {
    //TODO: You need to verify the sign in request is as intended and not tampered with. This step is critical if you have requested custom non-vanilla
    //      options (ownership requirements, other socials sign ins, and so on).
    //
    //      You can either use the verifyOptions and let BitBadges check the request for you, or you can implement your own verification.
    //      In other words, you nee to verify that the user did not maliciously tamper with the request.

    const verifyOptions: VerifySIWBBOptions = {};
    const authCodeRes = await BitBadgesApi.exchangeSIWBBAuthorizationCode({
      code,
      options: verifyOptions,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });
    const blockinChallenge = authCodeRes;

    const { verificationResponse } = blockinChallenge;
    if (!verificationResponse?.success) {
      return res
        .status(400)
        .json({ success: false, errorMessage: 'Did not pass verification: ' + verificationResponse?.errorMessage });
    }

    //----------------------------------------------CUSTOM LOGIC AND VERIFICATIOn-------------------------------------------------------

    //TODO: See https://docs.bitbadges.io/for-developers/authenticating-with-bitbadges/overview for more details on how to handle
    // You can now implement any additional checks or custom logic for your application (verifying attestations, protocols, etc.) on your end.
    // It is also important to prevent against common attacks like flash ownership attacks.

    // If you requested BitBadges API scopes, you can now access the access token and refresh token (see docs for more details)
    // All future requests must specify the access token in the Authorization header (Bearer token)
    // https://docs.bitbadges.io/for-developers/authenticating-with-bitbadges/verification
    //
    // const { access_token, access_token_expires_at, refresh_token, refresh_token_expires at } = doc;

    //----------------------------------------------SET SESSIONS-------------------------------------------------------

    // Finally, once ypu are satisfied with the verification, you can create a session for the user.
    //TODO: This is not a production-ready example. You should implement your own session management and security measures
    const sessionData = {
      address: blockinChallenge.address
    };

    // Set the session cookie
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('session', JSON.stringify(sessionData), {
        httpOnly: true, // Make the cookie accessible only via HTTP (not JavaScript)
        path: '/', // Set the cookie path to '/'
        sameSite: 'strict', // Specify the SameSite attribute for security
        secure: process.env.NODE_ENV === 'production' // Ensure the cookie is secure in production
      })
    );

    return res.redirect('/'); //Redirect to the home page
  } catch (err: any) {
    console.log(err);
    return res.status(400).json({ success: false, errorMessage: `${err.errorMessage ?? 'Verification failed'}` });
  }
};

export default signIn;
