import { VerifySIWBBOptions } from 'bitbadgesjs-sdk';
import cookie from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';
import { BitBadgesApi } from '../../bitbadges-api';

const CLIENT_ID = process.env.CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.CLIENT_SECRET ?? '';
const REDIRECT_URI = process.env.REDIRECT_URI ?? '';

//This will sign the user in to your backend. This is just an example and should be replaced with your own logic.
//This example uses session cookies to store the user's session.
const signIn = async (req: NextApiRequest, res: NextApiResponse) => {
  const code = req.query.code as string;
  // const state = req.query.state as string; // (state can be passed via the redirect from the original sign-in request)

  try {
    // Exchange the user's authorization code for a token. For in-person verification, the authorization code is their BitBadges QR code value.
    const verifyOptions: VerifySIWBBOptions = {};

    const authCodeRes = await BitBadgesApi.exchangeSIWBBAuthorizationCode({
      code,
      options: verifyOptions,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    });

    const { verificationResponse } = authCodeRes;
    if (!verificationResponse?.success) {
      return res
        .status(400)
        .json({ success: false, errorMessage: 'Did not pass verification: ' + verificationResponse?.errorMessage });
    }

    //----------------------------------------------CUSTOM LOGIC AND VERIFICATION-------------------------------------------------------

    //TODO: See https://docs.bitbadges.io/for-developers/authenticating-with-bitbadges/overview for more details on how to handle
    // You can now implement any additional checks or custom logic for your application (claims, ownership requirements, verifying attestations content, querying information like protocols, etc.) on your end.

    // If you requested BitBadges API scopes, you can now access the access token and refresh token (see docs for more details)
    // All future requests must specify the access token in the Authorization header (Bearer token)
    // https://docs.bitbadges.io/for-developers/authenticating-with-bitbadges/verification
    //
    // const { access_token, access_token_expires_at, refresh_token, refresh_token_expires at } = doc;

    // TODO: It is also necessary to prevent against common attacks like flash ownership attacks or replay attacks depending on your use case.

    //----------------------------------------------SET SESSIONS-------------------------------------------------------

    // Finally, once ypu are satisfied with the verification, you can create a session for the user.
    //TODO: This is not a production-ready example. You should implement your own session management and security measures
    const sessionData = {
      address: authCodeRes.address
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
