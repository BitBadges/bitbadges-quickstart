import { NextApiRequest, NextApiResponse } from 'next';

// Gets a secret user value if the user is signed in
const getPrivateInfo = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = req.cookies.session;
    if (!session) {
      return res.status(401).json({ message: 'You must be signed in to access this.' });
    }

    // You can also further gate info based on the user's session details
    // const sessionDetails = JSON.parse(session);
    // console.log(session.address);

    return res.status(200).json({
      message: 'The secret is: super secret password. This is only available to authenticated users.'
    });
  } catch (err) {
    return res.status(400).json({ message: `${err}` });
  }
};

export default getPrivateInfo;
