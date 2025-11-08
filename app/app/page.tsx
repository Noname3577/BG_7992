import { getCombinedMarketData } from '@/lib/bitkub-api';
import CoinTable from '@/components/CoinTable';
import MarketStats from '@/components/MarketStats';
import RefreshButton from '@/components/RefreshButton';
import type { CoinData } from '@/types/bitkub';

export const dynamic = 'force-dynamic';

export default async function Home() {
  let coins: CoinData[] = [];
  let error = null;

  try {
    coins = await getCombinedMarketData();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to fetch market data';
    console.error('Error in Home page:', err);
  }

  const gainers = coins.filter((coin) => coin.percentChange > 0).length;
  const losers = coins.filter((coin) => coin.percentChange < 0).length;
  const totalVolume = coins.reduce((sum, coin) => sum + coin.volume, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Bitkub Trading Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Real-time cryptocurrency market data from Bitkub Exchange
            </p>
          </div>
          <RefreshButton />
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            <p className="font-semibold">Error loading market data</p>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Market Stats */}
            <MarketStats
              totalCoins={coins.length}
              gainers={gainers}
              losers={losers}
              totalVolume={totalVolume}
            />

            {/* Coin Table */}
            <CoinTable coins={coins} />
          </>
        )}
      </div>
    </div>
  );
}
