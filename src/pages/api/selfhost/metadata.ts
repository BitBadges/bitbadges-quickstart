import { Metadata } from "bitbadgesjs-sdk";
import { NextApiRequest, NextApiResponse } from "next";

const getMetadata = async (_req: NextApiRequest, res: NextApiResponse) => {
  try {
    const metadata: Metadata<bigint> = {
      name: "BitBadges",
      description: "A decentralized, open-source, and permissionless protocol for creating, issuing, and verifying blockchain-based credentials.",
      image: "https://example.com",
    }

    return res.status(200).json({ ...metadata });
  } catch (err) {
    return res.status(400).json({ message: `${err}` });
  }
};

export default getMetadata;
