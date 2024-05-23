import { VerifyChallengeOptions } from 'blockin';
import cookie from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';
import { BitBadgesApi } from './bitbadges-api';

//For self verification
// import { getChainDriver } from "./selfverify/chainDriverHandlers";
// import { verifyChallenge } from "./selfverify/verifyChallenge";

const CLIENT_ID = process.env.CLIENT_ID ?? '';
const CLIENT_SECRET = process.env.CLIENT_SECRET ?? '';
const REDIRECT_URI = process.env.REDIRECT_URI ?? '';

//This will sign the user in to your backend. This is just an example and should be replaced with your own logic.
//This example uses session cookies to store the user's session.
//IMPORTANT: pre-requisite is that you have already verified the message and signature using the blockin library.
const signIn = async (req: NextApiRequest, res: NextApiResponse) => {
  //Parse the code and state from the query parameters
  const code = req.query.code as string;
  // const state = req.query.state as string; (if applicable, state can be passed via the redirect from the original sign-in request)

  try {
    //TODO: This step is critical. See BitBadges documentation for more details.
    const verifyOptions: VerifyChallengeOptions = {
      expectedChallengeParams: {
        // domain: ''
        // uri: ''
        // nonce: '',
        // resources: [],
      }
    };

    const authCodeRes = await BitBadgesApi.getAuthCode({
      code,
      options: verifyOptions,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      redirectUri: REDIRECT_URI
    });
    const blockinChallenge = authCodeRes.blockin;

    const { params, verificationResponse } = blockinChallenge;
    if (!verificationResponse?.success) {
      return res
        .status(400)
        .json({ success: false, errorMessage: 'Did not pass verification: ' + verificationResponse?.errorMessage });
    }

    // Alternative to using the BitBadgesApi is to self-verify directly with the Blockin library

    //If you reach here, the Blockin message is verified (pre-requisite). This means you now know the signature is valid and any assets specified are owned by the user.
    //We have also checked that the message parameters match what is expected and were not altered by the user (via options.expectedChallengeParams).

    //TODO: You now implement any additional checks or custom logic for your application, such as assigning sesssions, cookies, etc.
    //TODO: If you expect proof of secrets to be attached to the message, you can also verify them here.
    //See src/components/secrets/secrets.tsx for an example of how to verify secrets proofs.
    //It is also important to prevent replay attacks or flash ownership attacks (https://blockin.gitbook.io/blockin/developer-docs/core-concepts).

    if (!params.expirationDate) {
      return res.status(400).json({
        success: false,
        errorMessage: 'This sign-in does not have an expiration timestamp'
      });
    }

    // Create the session cookie data
    const sessionData = {
      params: params,
      siwbb: true
    };

    // Set the session cookie
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('session', JSON.stringify(sessionData), {
        httpOnly: true, // Make the cookie accessible only via HTTP (not JavaScript)
        expires: new Date(params.expirationDate), //Uses the expiration date set in the challenge
        path: '/', // Set the cookie path to '/'
        sameSite: 'strict', // Specify the SameSite attribute for security
        secure: process.env.NODE_ENV === 'production' // Ensure the cookie is secure in production
      })
    );

    //Once the code reaches here, you should considered the user authenticated.
    return res.redirect('/'); //Redirect to the home page
  } catch (err: any) {
    console.log(err);
    return res.status(400).json({ success: false, errorMessage: `${err.errorMessage ?? 'Verification failed'}` });
  }
};

export default signIn;
