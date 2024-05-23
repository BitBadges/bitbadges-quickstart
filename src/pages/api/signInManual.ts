import { BigIntify } from 'bitbadgesjs-sdk';
import { constructChallengeObjectFromString } from 'blockin';
import cookie from 'cookie';
import { NextApiRequest, NextApiResponse } from 'next';
import { BitBadgesApi } from './bitbadges-api';


//For self verification
// import { getChainDriver } from "./selfverify/chainDriverHandlers";
// import { verifyChallenge } from "./selfverify/verifyChallenge";

//This will sign the user in to your backend. This is just an example and should be replaced with your own logic.
//This example uses session cookies to store the user's session.
//IMPORTANT: pre-requisite is that you have already verified the message and signature using the blockin library.
const signInManual = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  let { message, signature, options, publicKey } = body;
  try {
    const params = constructChallengeObjectFromString(message, BigIntify);
    await BitBadgesApi.verifySignInGeneric({ message, signature, options, publicKey }); //Throws on error
    // console.log(authRes.blockin.verificationResponse);

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
      siwbb: false
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
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.log(err.errorMessage);
    return res.status(400).json({ success: false, errorMessage: `${err.errorMessage ?? 'Verification failed'}` });
  }
};

export default signInManual;
