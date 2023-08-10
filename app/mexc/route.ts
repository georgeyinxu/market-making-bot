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
  let prevAmount = 0;

  try {
    const bookOrderResponse: AxiosResponse = await axios.get(
      `${process.env.MEXC_API_URL}/api/v3/depth?symbol=SALDUSDT`
    );

    bookOrderData = bookOrderResponse.data;

    if (bookOrderData) {
        const asks = bookOrderData.asks;
        bookOrderData.asks = asks.reverse();
    }

    bookOrderData?.asks.map((ask) => {
      const total = prevAmount + parseFloat(ask[1]);
      totalAmountSALD.unshift(total);
      prevAmount = total;
    });
  } catch (error) {
    return res.status(400).send("Error due to: " + error);
  }

  return NextResponse.json({ bookOrderData, totalAmountSALD });
}
