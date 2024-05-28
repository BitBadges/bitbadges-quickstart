import { NextApiRequest, NextApiResponse } from 'next';

//TODO: Fill in missing information
const handlePlugin = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    //Step 1: Handle the request payload from the plugin
    const body = req.body; //We assume the plugin sends the payload in the body of the request (change this for GET)
    const {
      pluginSecret
      // priorState, claimId,  cosmosAddress, _isSimulation, lastUpdated, createdAt
    } = body;

    //Step 2: Verify BitBadges as origin by checking plugin secret is correct
    const YOUR_PLUGIN_SECRET = '';
    if (pluginSecret !== YOUR_PLUGIN_SECRET) {
      return res.status(401).json({ message: 'Invalid plugin secret' });
    }

    //Step 3: Implement your custom logic here. Consider checking the plugin's creation / last updated time to implement version control.
    //TODO:

    //Step 4: Return the response to the plugin based on your configured state function preset
    // const claimTokenRes = { claimToken: '...'  }
    // const stateTransitionRes = { ...newState }
    // const statelessRes = {};
    return res.status(200).json({});
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: `${err}` });
  }
};

export default handlePlugin;
