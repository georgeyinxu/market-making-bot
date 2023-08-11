import { NextResponse } from "next/server";
import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

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
  const { quantity, price, index } = await req.json();
  let buyOrderData = {};

  try {
    const buyOrderResponse: AxiosResponse = await axios.post(
      `${process.env.MEXC_API_URL}/api/v3/order?symbol=${
        process.env.SYMBOL
      }&side=BUY&type=LIMIT&quantity=${quantity}&price=${price}&timestamp=${Date.now()}&signature=${
        process.env.MEXC_SIGNATURE
      }`,
      {
        headers: {
          "x-mexc-apikey": process.env.MEXC_API_KEY,
        },
      }
    );

    buyOrderData = buyOrderResponse.data;
  } catch (error) {
    return res.status(400).send("Error due to: " + error);
  }
  return NextResponse.json({ index, buyOrderData });
}
