import { NextApiResponse } from "next";
import { RestClientV5 } from "bybit-api";
import { NextResponse } from "next/server";

const client = new RestClientV5({
  testnet: true,
  key: process.env.BYBIT_API_KEY,
  secret: process.env.BYBIT_API_SECRET,
});

interface ITransactionBody {
  index: number,
  saldAmount: number,
  usdtAmount: number,
  price: number
}

export async function POST(req: Request, res: NextApiResponse) {
  const { index, saldAmount, usdtAmount, price }: ITransactionBody = await req.json();
  let orderId = "";

  try {
    const result = await client.submitOrder({
      category: "spot",
      symbol: process.env.SYMBOL ? process.env.SYMBOL : "",
      side: "Buy",
      orderType: "Limit",
      qty: saldAmount.toString(), // Check if this is supposed to be USDT or SALD
      price: price.toString(),
      timeInForce: "GTC",
    });

    if (result.retMsg === "OK") {
      orderId = result.result.orderId;
    }
  } catch (error) {
    return res.status(400).send("Error due to: " + error);
  }

  return NextResponse.json({ data: {
    index
  }, });
}
