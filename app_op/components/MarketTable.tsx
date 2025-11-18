import { TickerData } from '@/types/market';
import { formatNumber } from '@/lib/utils/format';

interface MarketTableProps {
  filteredTickers: [string, TickerData][];
  totalTickers: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onRowClick: (symbol: string) => void;
}

export default function MarketTable({
  filteredTickers,
  totalTickers,
  searchQuery,
  onSearchChange,
  onRowClick,
}: MarketTableProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Market Tickers ({filteredTickers.length}/{totalTickers})
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              อัพเดทอัตโนมัติทุก 1 วินาที
            </p>
          </div>
          <div className="w-80">
            <input
              type="text"
              placeholder="ค้นหาคู่เทรด (เช่น BTC, ETH, SOL)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-zinc-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-900 dark:text-zinc-50 sticky left-0 bg-zinc-100 dark:bg-zinc-800 z-10">Symbol</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">Last</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">Change %</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">High 24h</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">Low 24h</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">Highest Bid</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">Lowest Ask</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">Base Volume</th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-zinc-900 dark:text-zinc-50">Quote Volume</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {filteredTickers.map(([symbol, data]) => (
              <tr 
                key={symbol}
                onClick={() => onRowClick(symbol)}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 sticky left-0 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <div className="flex items-center gap-2">
                    <span>{symbol}</span>
                    <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-right text-zinc-900 dark:text-zinc-50">
                  {formatNumber(data.last)}
                </td>
                <td className={`px-4 py-3 text-sm text-right font-medium ${
                  data.percentChange > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : data.percentChange < 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-zinc-900 dark:text-zinc-50'
                }`}>
                  {data.percentChange !== undefined 
                    ? `${data.percentChange > 0 ? '+' : ''}${formatNumber(data.percentChange)}%` 
                    : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                  {formatNumber(data.high24hr)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                  {formatNumber(data.low24hr)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                  {formatNumber(data.highestBid)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                  {formatNumber(data.lowestAsk)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                  {formatNumber(data.baseVolume, 4)}
                </td>
                <td className="px-4 py-3 text-sm text-right text-zinc-700 dark:text-zinc-300">
                  {formatNumber(data.quoteVolume, 2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
