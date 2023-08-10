import { NextApiRequest, NextApiResponse } from "next";

const { RestClientV5 } = require("bybit-api");

const client = new RestClientV5({
  testnet: true,
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
});

export async function POST(req: NextApiRequest, res: NextApiResponse) {}
