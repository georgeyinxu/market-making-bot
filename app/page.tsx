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

export default function Home() {
  const [orderBooks, setOrderBooks] = useState<TBookOrder | null>(null);
  const [totalAmountSALD, setTotalAmountSALD] = useState<Array<number>>([]);
  const [totalAmountUSDT, setTotalAmountUSDT] = useState<Array<number>>([]);

  // TODO: Add functionality to fetch every 10 seconds
  useEffect(() => {
    async function getOrderBooks() {
      const { bookOrderData, totalAmountSALD, totalAmountUSDT } = await fetchMEXCOrderBooks();
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
                return (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                    key={index}
                  >
                    <th
                      scope="row"
                      className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                    >
                      {ask[0]}
                    </th>
                    <td className="px-6 py-4">{ask[1]}</td>
                    <td className="px-6 py-4">
                      {(parseFloat(ask[0]) * parseFloat(ask[1])).toFixed(3)}
                    </td>
                    <td className="px-6 py-4">{totalAmountSALD[index].toFixed(3)}</td>
                    <td className="px-6 py-4">
                      {totalAmountUSDT[index].toFixed(3)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        className="text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900"
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
