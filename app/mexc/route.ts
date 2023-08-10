import { NextResponse } from "next/server";
import axios, { AxiosResponse } from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export interface TBookOrder {
    lastUpdateId: number,
    bids: [string, string][],
    asks: [string,string][],
    timestamp: number,
}

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    let bookOrderData: TBookOrder | null = null;  
  try {
    const bookOrderResponse: AxiosResponse = await axios.get(
      `${process.env.MEXC_API_URL}/api/v3/depth?symbol=SALDUSDT`
    );

    bookOrderData = bookOrderResponse.data;
  } catch (error) {
    return res.status(400).send("Error due to: " + error);
  }

  return NextResponse.json({ response: bookOrderData });
}
