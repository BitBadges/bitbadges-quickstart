import { NextApiRequest, NextApiResponse } from 'next';
import { BitBadgesApi } from './bitbadges-api';

const handleApiCallback = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    //Allow preflight requests (CORS)
    if(req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');

      return res.status(200).json({});
    }

    const {
      code
      // state
    } = req.query;

    //Check state (if applicable)

    const doc = await BitBadgesApi.exchangeForAccessToken({
      code: code as string,
      redirect_uri: 'http://localhost:3002/api/apiauth',
      client_id: process.env.CLIENT_ID as string,
      client_secret: process.env.CLIENT_SECRET as string,
      grant_type: 'authorization_code'
    });

    BitBadgesApi.setAccessToken(doc.accessToken);

    //TODO: Can also store the refresh token for future use
    //  const newDoc = await BitBadgesApi.exchangeForAccessToken({
    //     refresh_token: doc.refreshToken,
    //     redirect_uri: process.env.REDIRECT_URI as string,
    //     client_id: process.env.CLIENT_ID as string,
    //     client_secret: process.env.CLIENT_SECRET as string,
    //     grant_type: 'refresh_token'
    //  });

    //TODO: Handle revoking once done with it
    // await BitBadgesApi.revokeAuthorization({ token: doc.accessToken });
    // BitBadgesApi.unsetAccessToken();

    //Now, you can start making requests to the BitBadges API to authenticated endpoints based on the scopes you requested

    return res.redirect('/'); //Redirect to the home page
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: `${err}` });
  }
};

export default handleApiCallback;
