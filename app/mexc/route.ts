import { NextResponse } from "next/server";
import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

import Spot from "./spot";
const client = new Spot(process.env.MEXC_API_KEY, process.env.MEXC_API_SECRET, {
  baseURL: process.env.MEXC_API_URL,
});

export interface TBookOrder {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
  timestamp: number;
}

export async function GET(req: NextApiRequest, res: NextApiResponse) {
  let bookOrderData: TBookOrder | null = null;
  let totalAmountSALD: Array<number> = [];
  let totalAmountUSDT: Array<number> = [];
  let asksCopy: [string, string][] = [];
  let prevAmount = 0;

  try {
    const bookOrderResponse: AxiosResponse = await axios.get(
      `${process.env.MEXC_API_URL}/api/v3/depth?symbol=SALDUSDT`
    );

    bookOrderData = bookOrderResponse.data;

    if (bookOrderData) {
      const asks = bookOrderData.asks;
      asksCopy = asks;
      bookOrderData.asks = asks.reverse();
    }

    for (let i = asksCopy.length - 1; i >= 0; --i) {
      const totalSALD = prevAmount + parseFloat(asksCopy[i][1]);
      totalAmountSALD.unshift(totalSALD);

      const totalUSDT = totalSALD * parseFloat(asksCopy[i][0]);
      totalAmountUSDT.unshift(totalUSDT);

      prevAmount = totalSALD;
    }
  } catch (error) {
    return res.status(400).send("Error due to: " + error);
  }

  return NextResponse.json({ bookOrderData, totalAmountSALD, totalAmountUSDT });
}

export async function POST(req: Request, res: NextApiResponse) {
  // Place buy orders on MEXC for identified levels
  let { quantity, price, index } = await req.json();
  let buyOrderData = {};
  quantity = 200;
  price = 0.029;

  try {
    client
      .Order({
        type: "LIMIT",
        price,
        quantity,
        symbol: process.env.SYMBOL,
        side: "BUY",
      })
      .then((response) => buyOrderData = response.data);
  } catch (error) {
    console.log(error);
    return res.status(400).send("Error due to: " + error);
  }

  return NextResponse.json({ index, buyOrderData });
}
