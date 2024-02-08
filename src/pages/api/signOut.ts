import { NextApiRequest, NextApiResponse } from "next";

//Signs the user out by clearing the session cookie
const signOut = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const session = req.cookies.session;
    if (!session) {
      return res.status(401).json({ message: 'You must be signed in to access this.' });
    }

    res.setHeader('Set-Cookie', 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');

    return res.status(200).json({ message: 'Successfully signed out' });
  } catch (err) {
    return res.status(400).json({ message: `${err}` });
  }
};

export default signOut;


