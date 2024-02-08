import { BigIntify } from "bitbadgesjs-sdk";
import { getChainForAddress } from "bitbadgesjs-sdk";
import { constructChallengeObjectFromString } from "blockin";
import cookie from 'cookie';
import { NextApiRequest, NextApiResponse } from "next";
import { BitBadgesApi } from "./bitbadges-api";
import { db } from "./web2/db";

//For self verification
// import { getChainDriver } from "./selfverify/chainDriverHandlers";
// import { verifyChallenge } from "./selfverify/verifyChallenge";


//This will sign the user in to your backend. This is just an example and should be replaced with your own logic.
//This example uses session cookies to store the user's session. 
//IMPORTANT: pre-requisite is that you have already verified the message and signature using the blockin library.
const signIn = async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  let { message, signature, options, username, password, siwbb, publicKey } = body;

  try {
    const params = constructChallengeObjectFromString(message, BigIntify);
    const verificationResponse = await BitBadgesApi.verifySignInGeneric({ message, signature, options, publicKey });
    if (!verificationResponse.success) {
      return res.status(400).json({ success: false, errorMessage: 'Did not pass Blockin verification' });
    }

    // Alternative to using the BitBadgesApi is to self-verify directly with the Blockin library
    // See the selfverify folder
    //
    // const chain = getChainForAddress(params.address);
    // const chainDriver = getChainDriver(chain);
    // const verificationResponseSelfVerify = await verifyChallenge(
    //   chainDriver,
    //   body.message,
    //   body.signature,
    //   body.options,
    //   body.publicKey
    // );
    // if (!verificationResponseSelfVerify.success) {
    //   return res.status(400).json({ success: false, errorMessage: 'Did not pass self-verification' });
    // }


    //If you reach here, the Blockin message is verified (pre-requisite). This means you now know the signature is valid and any assets specified are owned by the user. 
    //We have also checked that the message parameters match what is expected and were not altered by the user (via options.expectedChallengeParams).

    //TODO: You now implement any additional checks or custom logic for your application, such as assigning sesssions, cookies, etc.
    //It is also important to prevent replay attacks or flash ownership attacks (https://blockin.gitbook.io/blockin/developer-docs/core-concepts).
    if (!params.expirationDate) {
      return res.status(400).json({ success: false, errorMessage: 'This sign-in does not have an expiration timestamp' });
    }

    if (!password) {
      //parse session cookie to get password
      password = JSON.parse(req.cookies.session ?? '{}').password;
    }

    if (!username) {
      //parse session cookie to get username
      username = JSON.parse(req.cookies.session ?? '{}').username;
    }

    if (username && !password) {
      return res.status(400).json({ success: false, errorMessage: 'Password is required if username' });
    }

    if (!username && password) {
      return res.status(400).json({ success: false, errorMessage: 'Username is required if password' });
    }

    //Only set cookie if (username, password) combo is valid
    if (password && username) {
      const details = await db.get(username);
      if (!details || details.password !== password) {
        return res.status(401).json({ success: false, errorMessage: 'Invalid username or password' });
      }
    }

    // Create the session cookie data
    const sessionData = {
      chain: getChainForAddress(params.address),
      address: params.address,
      nonce: params.nonce,
      username: username || '',
      password: password || '',
      siwbb: siwbb || false,
    };

    // Set the session cookie
    res.setHeader('Set-Cookie', cookie.serialize('session', JSON.stringify(sessionData), {
      httpOnly: true, // Make the cookie accessible only via HTTP (not JavaScript)
      expires: new Date(params.expirationDate), //Uses the expiration date set in the challenge
      path: '/', // Set the cookie path to '/'
      sameSite: 'strict', // Specify the SameSite attribute for security
      secure: process.env.NODE_ENV === 'production', // Ensure the cookie is secure in production
    }));


    //Once the code reaches here, you should considered the user authenticated.
    return res.status(200).json({ success: true });

  } catch (err: any) {
    console.log(err);
    return res.status(400).json({ success: false, errorMessage: `${err.errorMessage ?? 'Verification failed'}` });
  }
};

export default signIn;
