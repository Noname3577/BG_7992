import { TickerData, SymbolInfo } from '@/types/market';
import { formatNumber } from '@/lib/utils/format';
import { useChartData } from '@/hooks/useChartData';
import CandlestickChart from '@/components/CandlestickChart';
import { useState } from 'react';

interface SymbolModalProps {
  show: boolean;
  symbol: string | null;
  symbolInfo: SymbolInfo | undefined;
  tickerData: TickerData | undefined;
  onClose: () => void;
}

type TimeRange = '1H' | '4H' | '1D' | '1W';

const timeRangeConfig = {
  '1H': { resolution: '1', seconds: 3600 },
  '4H': { resolution: '15', seconds: 4 * 3600 },
  '1D': { resolution: '60', seconds: 24 * 3600 },
  '1W': { resolution: '240', seconds: 7 * 24 * 3600 },
};

export default function SymbolModal({
  show,
  symbol,
  symbolInfo,
  tickerData,
  onClose,
}: SymbolModalProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  
  // แปลง symbol จาก THB_BTC เป็น BTC_THB สำหรับ chart API
  const chartSymbol = symbol?.startsWith('THB_') 
    ? symbol.replace('THB_', '') + '_THB'
    : symbol || '';

  const now = Math.floor(Date.now() / 1000);
  const config = timeRangeConfig[timeRange];
  
  // เรียก useChartData เฉพาะเมื่อมี symbol และ modal แสดงอยู่
  const shouldFetchChart = !!(show && symbol && chartSymbol);
  
  const { chartData, loading: chartLoading } = useChartData({
    symbol: shouldFetchChart ? chartSymbol : 'BTC_THB', // ใช้ default symbol เพื่อไม่ให้ empty
    resolution: config.resolution,
    from: now - config.seconds,
    to: now,
    autoRefresh: shouldFetchChart, // เปิด auto refresh เฉพาะเมื่อควร fetch
    refreshInterval: 60000, // refresh every minute
  });

  if (!show || !symbol) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 flex items-center justify-between z-10">
          <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {symbol}
          </h3>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            {/* Price Chart Section */}
            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  📈 กราฟราคา
                </h4>
                <div className="flex gap-2">
                  {(Object.keys(timeRangeConfig) as TimeRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        timeRange === range
                          ? 'bg-blue-600 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              
              {chartLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                  <div className="text-zinc-500 dark:text-zinc-400">กำลังโหลดกราฟ...</div>
                </div>
              ) : (
                <CandlestickChart data={chartData} symbol={symbol} />
              )}
            </div>

            {!symbolInfo && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-200">
                  ⚠️ ไม่พบข้อมูลเพิ่มเติมสำหรับ {symbol}
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  กรุณาตรวจสอบ Console (F12) เพื่อดูรายละเอียด
                </p>
              </div>
            )}
            
            {/* ข้อมูลพื้นฐาน */}
            {symbolInfo && (
              <div>
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                  ข้อมูลทั่วไป
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">ชื่อเหรียญ</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{symbolInfo.name}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">คำอธิบาย</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{symbolInfo.description}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">สถานะ</p>
                    <p className={`text-lg font-semibold ${
                      symbolInfo.status === 'active' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {symbolInfo.status === 'active' ? '🟢 เปิดใช้งาน' : '🔴 ปิดใช้งาน'}
                    </p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">ประเภทตลาด</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{symbolInfo.market_segment}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ข้อมูลการเทรด */}
            {symbolInfo && (
              <div>
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                  ข้อมูลการเทรด
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">สินทรัพย์พื้นฐาน</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{symbolInfo.base_asset}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">สินทรัพย์อ้างอิง</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{symbolInfo.quote_asset}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">ทศนิยมราคา</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{symbolInfo.price_scale} ตำแหน่ง</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">ขั้นต่ำ: {symbolInfo.price_step}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">ทศนิยมปริมาณ</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{symbolInfo.quantity_scale} ตำแหน่ง</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">ขั้นต่ำ: {symbolInfo.quantity_step}</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">ยอดซื้อขั้นต่ำ</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{symbolInfo.min_quote_size.toLocaleString()} THB</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">สถานะการซื้อ/ขาย</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {symbolInfo.freeze_buy ? '🔒 ซื้อ' : '✅ ซื้อ'} / {symbolInfo.freeze_sell ? '🔒 ขาย' : '✅ ขาย'}
                    </p>
                    {symbolInfo.freeze_cancel && <p className="text-xs text-red-500">🔒 ยกเลิกคำสั่งถูกระงับ</p>}
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Gap ราคาซื้อ/ขาย</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      ซื้อ: {symbolInfo.buy_price_gap_as_percent}% / ขาย: {symbolInfo.sell_price_gap_as_percent}%
                    </p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">แหล่งข้อมูล</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{symbolInfo.source}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">Pairing ID: {symbolInfo.pairing_id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ข้อมูลเวลา */}
            {symbolInfo && (
              <div>
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
                  ข้อมูลเวลา
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-lg">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">สร้างเมื่อ</p>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                      {new Date(symbolInfo.created_at).toLocaleString('th-TH', {
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
                      {new Date(symbolInfo.modified_at).toLocaleString('th-TH', {
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
            {symbolInfo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📋 ข้อมูลเพิ่มเติม
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Asset Scale: Base {symbolInfo.base_asset_scale} ตำแหน่ง, Quote {symbolInfo.quote_asset_scale} ตำแหน่ง</li>
                  <li>• Price Step: เพิ่ม/ลดราคาขั้นต่ำ {symbolInfo.price_step} {symbolInfo.quote_asset}</li>
                  <li>• Quantity Step: เพิ่ม/ลดปริมาณขั้นต่ำ {symbolInfo.quantity_step} {symbolInfo.base_asset}</li>
                  <li>• ข้อมูลนี้อัพเดทจาก Bitkub API v3</li>
                </ul>
              </div>
            )}

            {/* แสดงข้อมูล Raw สำหรับ Debug */}
            {symbolInfo && (
              <details className="mt-4">
                <summary className="text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-200">
                  🔧 ดูข้อมูล JSON แบบเต็ม (สำหรับนักพัฒนา)
                </summary>
                <pre className="mt-2 p-4 bg-zinc-100 dark:bg-zinc-800 rounded text-xs overflow-auto max-h-60">
                  {JSON.stringify(symbolInfo, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
