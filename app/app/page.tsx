'use client';

import { useEffect, useState } from 'react';

interface TickerData {
  id: number;
  last: number;
  lowestAsk: number;
  highestBid: number;
  percentChange: number;
  baseVolume: number;
  quoteVolume: number;
  isFrozen: number;
  high24hr: number;
  low24hr: number;
  change: number;
  prevClose: number;
  prevOpen: number;
}

interface TickerResponse {
  [symbol: string]: TickerData;
}

interface ServerTime {
  [key: string]: number;
}

export default function Home() {
  const [tickers, setTickers] = useState<[string, TickerData][]>([]);
  const [serverTime, setServerTime] = useState<ServerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    try {
      // ดึงข้อมูล Ticker ผ่าน API Route ของเราเอง
      const tickerResponse = await fetch('/api/symbols', {
        cache: 'no-store',
      });
      
      if (!tickerResponse.ok) {
        throw new Error(`HTTP error! status: ${tickerResponse.status}`);
      }
      
      const tickerData: TickerResponse = await tickerResponse.json();
      
      console.log('Ticker Data:', tickerData);
      console.log('Data keys:', Object.keys(tickerData));
      
      // ดึงข้อมูล Server Time ผ่าน API Route ของเราเอง
      const timeResponse = await fetch('/api/servertime', {
        cache: 'no-store',
      });
      const timeData = await timeResponse.json();
      
      // แปลง object เป็น array และกรองเฉพาะ THB pairs
      const tickerArray = Object.entries(tickerData)
        .filter(([symbol]) => symbol.startsWith('THB_'))
        .sort((a, b) => a[0].localeCompare(b[0]));
      
      console.log('Filtered tickers:', tickerArray.length);
      
      setTickers(tickerArray);
      setServerTime(timeData);
      setLastUpdate(new Date());
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('ไม่สามารถดึงข้อมูลได้: ' + (err instanceof Error ? err.message : 'Unknown error'));
      setLoading(false);
    }
  };

  useEffect(() => {
    // ดึงข้อมูลครั้งแรก
    fetchData();

    // ตั้งค่าให้ดึงข้อมูลทุก 1 วินาที
    const interval = setInterval(() => {
      fetchData();
    }, 1000);

    // ล้าง interval เมื่อ component ถูก unmount
    return () => clearInterval(interval);
  }, []);

  const formatServerTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('th-TH', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatNumber = (num: number | undefined, decimals: number = 2) => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals 
    });
  };

  // กรองข้อมูลตามคำค้นหา
  const filteredTickers = tickers.filter(([symbol]) => 
    symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-xl text-zinc-900 dark:text-zinc-50">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-xl text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-8">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-6">
          Bitkub Market Data (Real-time)
        </h1>
        
        {/* แสดง Server Time */}
        <div className="mb-6 p-4 bg-white dark:bg-zinc-900 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
            Server Time
          </h2>
          {serverTime && (
            <div className="space-y-1 text-zinc-700 dark:text-zinc-300">
              <p className="text-sm">
                เวลาอัพเดท: {lastUpdate?.toLocaleTimeString('th-TH')}
              </p>
              {Object.entries(serverTime).map(([key, value]) => (
                <p key={key} className="text-sm">
                  <span className="font-semibold">{key}:</span>{' '}
                  {typeof value === 'number' ? formatServerTime(value) : value}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* แสดง Tickers */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Market Tickers ({filteredTickers.length}/{tickers.length})
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
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-50 sticky left-0 bg-white dark:bg-zinc-900">
                      {symbol}
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

        {/* Status Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live - อัพเดทล่าสุด: {lastUpdate?.toLocaleTimeString('th-TH')}</span>
        </div>
      </div>
    </div>
  );
}
