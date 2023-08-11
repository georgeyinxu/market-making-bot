import { NextApiResponse } from "next";
import { RestClientV5 } from "bybit-api";
import { NextResponse } from "next/server";

const client = new RestClientV5({
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
});

interface ITransactionBody {
  index: number;
  saldAmount: number;
  usdtAmount: number;
  price: number;
}

export async function POST(req: Request, res: NextApiResponse) {
  let { index, saldAmount, price }: ITransactionBody = await req.json();
  let orderId = "";

  try {
    const result = await client.submitOrder({
      category: "spot",
      symbol: process.env.SYMBOL ? process.env.SYMBOL : "",
      side: "Sell",
      orderType: "Limit",
      qty: saldAmount.toString(), // SALD Amount
      price: price.toString(),
      timeInForce: "GTC",
    });

    if (result.retMsg === "OK") {
      orderId = result.result.orderId;
    }
  } catch (error) {
    return res.status(400).send("Error due to: " + error);
  }

  return NextResponse.json({
    data: {
      index,
    },
  });
}

export async function GET(req: Request, res: NextApiResponse) {
  let sald = 0;
  let usdt = 0;
  try {
    const result = await client.getWalletBalance({
      accountType: "SPOT",
    });

    if (result.retMsg === "OK") {
      const coinsList = result.result.list[0].coin
      const usdtItem = coinsList.filter(item => item.coin === 'USDT')
      const saldItem = coinsList.filter(item => item.coin === 'SALD')
      
      usdt = parseFloat(usdtItem[0].walletBalance);
      sald = parseFloat(saldItem[0].walletBalance);
    }
  } catch (error) {
    return res.status(400).send("Error due to: " + error);
  }

  return NextResponse.json({
    usdt,
    sald,
  });
}
