"use client";
import { useEffect, useState } from "react";
import { TBookOrder } from "./mexc/route";

async function fetchMEXCOrderBooks() {
  const data = await fetch(`http://localhost:3000/mexc`);

  if (!data.ok) {
    throw new Error("Failed to fetch order books");
  }

  return data.json();
}

// SALD and USDT Amount is for that specific row
// Function to be called in a loop to handle one transaction at a time
async function sendTransaction(
  index: number,
  saldAmount: number,
  usdtAmount: number,
  price: number
) {
  const data = await fetch("http://localhost:3000/bybit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      index,
      saldAmount,
      usdtAmount,
      price
    }),
  });

  if (!data.ok) {
    throw new Error(`Failed to send transaction at index: ${index} for ${saldAmount} SALD.`);
  }

  return data.json();
}

export default function Home() {
  const [orderBooks, setOrderBooks] = useState<TBookOrder | null>(null);
  const [totalAmountSALD, setTotalAmountSALD] = useState<Array<number>>([]);
  const [totalAmountUSDT, setTotalAmountUSDT] = useState<Array<number>>([]);

  const handleTrade = (tradeIndex: number) => {
    // From the trade index, I will need to make a place order from the last index till the trade index. Passing in the value of total SALD and total USDT;
    const asks = orderBooks?.asks;
    if (asks) {
      for (let i = asks.length - 1; i >= tradeIndex; i--) {
        const saldAmount = parseFloat(asks[i][1]);
        const price = parseFloat(asks[i][0]);
        const usdtAmount = price * saldAmount;
        sendTransaction(i, saldAmount, usdtAmount, price);
      }
    }
  };

  // TODO: Add functionality to fetch every 10 seconds
  useEffect(() => {
    async function getOrderBooks() {
      const { bookOrderData, totalAmountSALD, totalAmountUSDT } =
        await fetchMEXCOrderBooks();
      setOrderBooks(bookOrderData);
      setTotalAmountSALD(totalAmountSALD);
      setTotalAmountUSDT(totalAmountUSDT);
    }

    getOrderBooks();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h3 className="font-bold text-2xl underline mb-4">
        MEXC Sell Order Books
      </h3>
      <div className="relative overflow-x-auto rounded-lg">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Level
              </th>
              <th scope="col" className="px-6 py-3">
                SALD Amount
              </th>
              <th scope="col" className="px-6 py-3">
                USDT Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Total SALD
              </th>
              <th scope="col" className="px-6 py-3">
                Total USDT
              </th>
              <th scope="col" className="px-6 py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {orderBooks !== null &&
              orderBooks?.asks.map((ask, index) => {
                const level = ask[0];
                const sald = ask[1];
                const usdt = (parseFloat(ask[0]) * parseFloat(ask[1])).toFixed(
                  3
                );
                const totalSALD = totalAmountSALD[index].toFixed(3);
                const totalUSDT = totalAmountUSDT[index].toFixed(3);

                return (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    key={index}
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {level}
                    </th>
                    <td className="px-6 py-4">{sald}</td>
                    <td className="px-6 py-4">{usdt}</td>
                    <td className="px-6 py-4">{totalSALD}</td>
                    <td className="px-6 py-4">{totalUSDT}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
                        onClick={() => handleTrade(index)}
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
