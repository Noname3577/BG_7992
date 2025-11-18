'use client';

import { useState } from 'react';
import { useChartData } from '@/hooks/useChartData';
import CandlestickChart from '@/components/CandlestickChart';

type TimeRange = '1H' | '4H' | '1D' | '1W';
type Resolution = '1' | '5' | '15' | '60' | '240' | '1D';

const timeRangeConfig: Record<TimeRange, { resolution: Resolution; seconds: number; label: string }> = {
  '1H': { resolution: '1', seconds: 3600, label: '1 ชั่วโมง' },
  '4H': { resolution: '15', seconds: 4 * 3600, label: '4 ชั่วโมง' },
  '1D': { resolution: '60', seconds: 24 * 3600, label: '1 วัน' },
  '1W': { resolution: '240', seconds: 7 * 24 * 3600, label: '1 สัปดาห์' },
};

const popularSymbols = [
  'BTC_THB',
  'ETH_THB',
  'USDT_THB',
  'XRP_THB',
  'ADA_THB',
  'SOL_THB',
  'DOGE_THB',
  'MATIC_THB',
];

export default function ChartPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC_THB');
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  
  const now = Math.floor(Date.now() / 1000);
  const config = timeRangeConfig[timeRange];
  
  const { chartData, loading, error } = useChartData({
    symbol: selectedSymbol,
    resolution: config.resolution,
    from: now - config.seconds,
    to: now,
    autoRefresh: true,
    refreshInterval: 60000,
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          📊 Bitkub Price Charts
        </h1>

        {/* Symbol Selector */}
        <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            เลือกเหรียญ
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {popularSymbols.map((symbol) => (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedSymbol === symbol
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {symbol.replace('_THB', '')}
              </button>
            ))}
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            ช่วงเวลา
          </h2>
          <div className="flex gap-3">
            {(Object.keys(timeRangeConfig) as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {range}
                <span className="block text-xs opacity-75">
                  {timeRangeConfig[range].label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow p-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-4">
              <p className="text-red-800 dark:text-red-200">
                ❌ เกิดข้อผิดพลาด: {error}
              </p>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-zinc-600 dark:text-zinc-400">กำลังโหลดข้อมูลกราฟ...</p>
              </div>
            </div>
          ) : (
            <CandlestickChart data={chartData} symbol={selectedSymbol} />
          )}
          
          <div className="mt-4 flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>อัพเดทอัตโนมัติทุก 1 นาที</span>
            </div>
            <div>
              ข้อมูล: {chartData.length} data points
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
            💡 คำแนะนำ
          </h3>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            <li>• เลื่อนเมาส์ไปที่กราฟเพื่อดูรายละเอียดราคา</li>
            <li>• กราฟแสดงแท่งเทียน (Candlestick) พร้อม Volume</li>
            <li>• เขียว = ราคาปิดสูงกว่าราคาเปิด, แดง = ราคาปิดต่ำกว่าราคาเปิด</li>
            <li>• ข้อมูลอัพเดทอัตโนมัติทุก 1 นาที</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
