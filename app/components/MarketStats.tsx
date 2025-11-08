'use client';

import { useEffect, useState } from 'react';

interface MarketStatsProps {
  totalCoins: number;
  gainers: number;
  losers: number;
  totalVolume: number;
}

export default function MarketStats({
  totalCoins,
  gainers,
  losers,
  totalVolume,
}: MarketStatsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const formatVolume = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`;
    }
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Total Markets
        </div>
        <div className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
          {totalCoins}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          24h Gainers
        </div>
        <div className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
          {gainers}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          24h Losers
        </div>
        <div className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
          {losers}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Total Volume
        </div>
        <div className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">
          {formatVolume(totalVolume)}
        </div>
      </div>
    </div>
  );
}
