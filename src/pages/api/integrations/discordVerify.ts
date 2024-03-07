import axios from 'axios';
import { BigIntify } from 'bitbadgesjs-sdk';
import { constructChallengeObjectFromString } from 'blockin';
import Discord from 'discord.js';
import { NextApiRequest, NextApiResponse } from 'next';
import { BitBadgesApi } from '../bitbadges-api';

const client = new Discord.Client({
  intents: ['Guilds', 'GuildMembers']
});

//See signIn.ts for self-verification example (not API)

//Initiate Discord client
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const BOT_TOKEN = process.env.BOT_TOKEN;
client.login(BOT_TOKEN);

// This is the callback URL for Discord OAuth2
// When the user signs in with Discord, they will be redirected to this URL with a code and state parameter
// The code can be redeemed for an access token, and the state parameter can be used to verify the sign in request with Blockin
const discordVerify = async (req: NextApiRequest, res: NextApiResponse) => {
  //Parse the code and state from the query parameters
  const code = req.query.code;
  const state = req.query.state as string;

  try {
    const stateData = JSON.parse(state ?? '{}');
    const { message, signature, publicKey, options } = stateData; //You can also check the verificationResponse.success field to see if the message was verified on the clientside but this value should not be trusted.
    console.log(options);
    //Step 1: Verify the message and signature on the backend yourself
    const params = constructChallengeObjectFromString(message, BigIntify);

    //Throws an error if the message and signature are not verified
    await BitBadgesApi.verifySignInGeneric({
      message,
      signature,
      options: options ? JSON.parse(options) : undefined,
      publicKey
    });

    // You could also just use the Blockin library for signature verification and query badge balances here

    console.log('This sign in request was verified by Blockin for the user', params.address);

    //Step 2: Verify the Discord code authentication
    // Exchange authorization code for access token
    const response = await axios.post(
      'https://discord.com/api/oauth2/token',
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const access_token = response.data.access_token;
    if (!access_token) {
      return res.status(500).send('Error exchanging code for access token');
    }

    // Use the access token to fetch user information
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const discordUserId = userResponse.data.id;
    const discordUsername = userResponse.data.username;
    const discordAccessToken = access_token;

    //Step 3: Grant the user roles on Discord
    if (discordAccessToken) {
      //assign the "whitelist" role to the user
      const userId = discordUserId;
      const guildId = process.env.GUILD_ID;
      const guild = await client.guilds.fetch(guildId ?? '');
      if (!guild) {
        return res.status(400).json({ success: false, errorMessage: 'Guild not found' });
      }

      const member = await guild.members.fetch(userId);
      const role = guild.roles.cache.find((role) => role.name === process.env.ROLE_ID);
      if (role && member) {
        await member.roles.add(role).then(() => {
          console.log(`User has been whitelisted and assigned the ${role.name} role.`);
        });
      } else {
        throw new Error('Role or member not found');
      }
    }

    return res
      .status(200)
      .send(
        `Successfully assigned the owner role to ${discordUsername} on the Discord server. You can now close this window.`
      );
  } catch (error: any) {
    console.log('Error:', error);
    res.status(500).send('Error handling sign in request: ' + error.errorMessage ?? error.message);
  }
};

export default discordVerify;
