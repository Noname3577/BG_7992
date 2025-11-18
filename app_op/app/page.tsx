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

interface SymbolInfo {
  symbol: string;
  name: string;
  description: string;
  status: string;
  base_asset: string;
  quote_asset: string;
  base_asset_scale: number;
  quote_asset_scale: number;
  price_scale: number;
  price_step: string;
  quantity_scale: number;
  quantity_step: string;
  min_quote_size: number;
  freeze_buy: boolean;
  freeze_sell: boolean;
  freeze_cancel: boolean;
  market_segment: string;
  pairing_id: number;
  buy_price_gap_as_percent: number;
  sell_price_gap_as_percent: number;
  source: string;
  created_at: string;
  modified_at: string;
}

interface MarketSymbolsResponse {
  error: number;
  result: SymbolInfo[];
}

export default function Home() {
  const [tickers, setTickers] = useState<[string, TickerData][]>([]);
  const [serverTime, setServerTime] = useState<ServerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [symbolsInfo, setSymbolsInfo] = useState<Map<string, SymbolInfo>>(new Map());
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchMarketSymbols = async () => {
    try {
      console.log('🔄 กำลังดึงข้อมูล Market Symbols...');
      const response = await fetch('/api/market-symbols', {
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: MarketSymbolsResponse = await response.json();
      console.log('✅ Market Symbols API Response:', data);
      console.log('📊 จำนวนข้อมูลทั้งหมด:', data.result?.length || 0);
      
      if (data.error === 0 && data.result) {
        const symbolsMap = new Map<string, SymbolInfo>();
        data.result.forEach((symbol) => {
          symbolsMap.set(symbol.symbol, symbol);
        });
        console.log(`✅ โหลดข้อมูล ${symbolsMap.size} คู่เทรดสำเร็จ`);
        console.log('📝 ตัวอย่างข้อมูลแรก:', data.result[0]);
        setSymbolsInfo(symbolsMap);
      } else {
        console.error('❌ API ส่งข้อมูลผิดพลาด:', data);
      }
    } catch (err) {
      console.error('❌ Error fetching market symbols:', err);
    }
  };

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
    // ดึงข้อมูล market symbols ครั้งเดียวตอนเริ่มต้น
    fetchMarketSymbols();
    
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

  const handleRowClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    setShowModal(true);
  };

  const getSymbolInfo = (symbol: string) => {
    // Ticker API ใช้ THB_BTC แต่ Symbols API ใช้ BTC_THB
    // ต้องแปลง THB_BTC -> BTC_THB
    const convertedSymbol = symbol.startsWith('THB_') 
      ? symbol.replace('THB_', '') + '_THB'
      : symbol;
    
    console.log('🔍 ค้นหาข้อมูล:', { original: symbol, converted: convertedSymbol });
    const info = symbolsInfo.get(convertedSymbol);
    console.log('📦 ผลลัพธ์:', info ? 'พบข้อมูล' : 'ไม่พบข้อมูล');
    
    return info;
  };

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
                    onClick={() => handleRowClick(symbol)}
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

        {/* Status Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live - อัพเดทล่าสุด: {lastUpdate?.toLocaleTimeString('th-TH')}</span>
        </div>
      </div>

      {/* Modal ป๊อปอัพแสดงข้อมูลเพิ่มเติม */}
      {showModal && selectedSymbol && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {selectedSymbol}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              {(() => {
                const info = getSymbolInfo(selectedSymbol);
                const tickerData = tickers.find(([sym]) => sym === selectedSymbol)?.[1];
                
                return (
                  <div className="space-y-6">
                    {!info && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <p className="text-yellow-800 dark:text-yellow-200">
                          ⚠️ ไม่พบข้อมูลเพิ่มเติมสำหรับ {selectedSymbol}
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                          กรุณาตรวจสอบ Console (F12) เพื่อดูรายละเอียด
                        </p>
                      </div>
                    )}
                    
                    {/* ข้อมูลพื้นฐาน */}
                    {info && (
                      <div>
                        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                          ข้อมูลทั่วไป
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">ชื่อเหรียญ</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{info.name}</p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">คำอธิบาย</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{info.description}</p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">สถานะ</p>
                            <p className={`text-lg font-semibold ${
                              info.status === 'active' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {info.status === 'active' ? '🟢 เปิดใช้งาน' : '🔴 ปิดใช้งาน'}
                            </p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">ประเภทตลาด</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{info.market_segment}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ข้อมูลการเทรด */}
                    {info && (
                      <div>
                        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                          ข้อมูลการเทรด
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">สินทรัพย์พื้นฐาน</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{info.base_asset}</p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">สินทรัพย์อ้างอิง</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{info.quote_asset}</p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">ทศนิยมราคา</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{info.price_scale} ตำแหน่ง</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500">ขั้นต่ำ: {info.price_step}</p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">ทศนิยมปริมาณ</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{info.quantity_scale} ตำแหน่ง</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500">ขั้นต่ำ: {info.quantity_step}</p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">ยอดซื้อขั้นต่ำ</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{info.min_quote_size.toLocaleString()} THB</p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">สถานะการซื้อ/ขาย</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                              {info.freeze_buy ? '🔒 ซื้อ' : '✅ ซื้อ'} / {info.freeze_sell ? '🔒 ขาย' : '✅ ขาย'}
                            </p>
                            {info.freeze_cancel && <p className="text-xs text-red-500">🔒 ยกเลิกคำสั่งถูกระงับ</p>}
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">Gap ราคาซื้อ/ขาย</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                              ซื้อ: {info.buy_price_gap_as_percent}% / ขาย: {info.sell_price_gap_as_percent}%
                            </p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">แหล่งข้อมูล</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{info.source}</p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500">Pairing ID: {info.pairing_id}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ข้อมูลเวลา */}
                    {info && (
                      <div>
                        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                          ข้อมูลเวลา
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">สร้างเมื่อ</p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                              {new Date(info.created_at).toLocaleString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">แก้ไขล่าสุด</p>
                            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                              {new Date(info.modified_at).toLocaleString('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ข้อมูลราคา Real-time */}
                    {tickerData && (
                      <div>
                        <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                          ข้อมูลราคา Real-time
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">ราคาล่าสุด</p>
                            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                              {formatNumber(tickerData.last)} THB
                            </p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">การเปลี่ยนแปลง 24h</p>
                            <p className={`text-2xl font-bold ${
                              tickerData.percentChange > 0 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {tickerData.percentChange > 0 ? '+' : ''}{formatNumber(tickerData.percentChange)}%
                            </p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">สูงสุด 24h</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                              {formatNumber(tickerData.high24hr)} THB
                            </p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">ต่ำสุด 24h</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                              {formatNumber(tickerData.low24hr)} THB
                            </p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">ปริมาณซื้อขายฐาน</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                              {formatNumber(tickerData.baseVolume, 4)}
                            </p>
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">ปริมาณซื้อขาย THB</p>
                            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                              {formatNumber(tickerData.quoteVolume, 2)} THB
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ข้อกำหนดและหมายเหตุ */}
                    {info && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          📋 ข้อมูลเพิ่มเติม
                        </h4>
                        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                          <li>• Asset Scale: Base {info.base_asset_scale} ตำแหน่ง, Quote {info.quote_asset_scale} ตำแหน่ง</li>
                          <li>• Price Step: เพิ่ม/ลดราคาขั้นต่ำ {info.price_step} {info.quote_asset}</li>
                          <li>• Quantity Step: เพิ่ม/ลดปริมาณขั้นต่ำ {info.quantity_step} {info.base_asset}</li>
                          <li>• ข้อมูลนี้อัพเดทจาก Bitkub API v3</li>
                        </ul>
                      </div>
                    )}

                    {/* แสดงข้อมูล Raw สำหรับ Debug */}
                    {info && (
                      <details className="mt-4">
                        <summary className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200">
                          🔧 ดูข้อมูล JSON แบบเต็ม (สำหรับนักพัฒนา)
                        </summary>
                        <pre className="mt-2 p-4 bg-zinc-100 dark:bg-zinc-800 rounded text-xs overflow-auto max-h-60">
                          {JSON.stringify(info, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
