'use client';

import { ChartDataPoint } from '@/types/market';
import { formatNumber } from '@/lib/utils/format';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
} from 'recharts';

interface CandlestickChartProps {
  data: ChartDataPoint[];
  symbol: string;
}

const CustomCandlestick = (props: any) => {
  const { x, y, width, height, payload } = props;
  
  // ตรวจสอบว่า payload มีข้อมูลหรือไม่
  if (!payload || !payload.open || !payload.close || !payload.high || !payload.low) {
    return null;
  }
  
  const { open, close, high, low } = payload;

  const isGreen = close > open;
  const color = isGreen ? '#10b981' : '#ef4444';
  const fillColor = isGreen ? '#10b981' : '#ef4444';

  const candleWidth = Math.max(width * 0.6, 2);
  const xCenter = x + width / 2;
  const wickX = xCenter - 0.5;

  const bodyTop = Math.min(open, close);
  const bodyBottom = Math.max(open, close);
  const bodyHeight = Math.abs(close - open);

  return (
    <g>
      {/* Wick (เส้นแท่ง) */}
      <line
        x1={wickX}
        y1={high}
        x2={wickX}
        y2={low}
        stroke={color}
        strokeWidth={1}
      />
      {/* Body (ตัวแท่งเทียน) */}
      <rect
        x={xCenter - candleWidth / 2}
        y={bodyTop}
        width={candleWidth}
        height={bodyHeight || 1}
        fill={fillColor}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length && payload[0].payload) {
    const data = payload[0].payload;
    
    // ตรวจสอบว่ามีข้อมูลครบถ้วน
    if (!data.close || !data.open || !data.high || !data.low || !data.time) {
      return null;
    }
    
    const isGreen = data.close > data.open;
    const change = ((data.close - data.open) / data.open) * 100;
    
    return (
      <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          {new Date(data.time * 1000).toLocaleString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
        <div className="space-y-1 text-xs">
          <p className="text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold">Open:</span> {formatNumber(data.open)}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold">High:</span> {formatNumber(data.high)}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold">Low:</span> {formatNumber(data.low)}
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold">Close:</span> {formatNumber(data.close)}
          </p>
          <p className={`font-semibold ${isGreen ? 'text-green-600' : 'text-red-600'}`}>
            Change: {change > 0 ? '+' : ''}{formatNumber(change, 2)}%
          </p>
          <p className="text-zinc-600 dark:text-zinc-400">
            <span className="font-semibold">Volume:</span> {formatNumber(data.volume, 4)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function CandlestickChart({ data, symbol }: CandlestickChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-zinc-50 dark:bg-zinc-900 rounded-lg">
        <p className="text-zinc-500 dark:text-zinc-400">ไม่มีข้อมูลกราฟ</p>
      </div>
    );
  }

  // ตรวจสอบว่าข้อมูลมีค่า OHLCV ครบถ้วน
  const validData = data.filter(d => 
    d.open !== undefined && 
    d.close !== undefined && 
    d.high !== undefined && 
    d.low !== undefined &&
    d.time !== undefined
  );

  if (validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-zinc-50 dark:bg-zinc-900 rounded-lg">
        <p className="text-zinc-500 dark:text-zinc-400">ข้อมูลกราฟไม่สมบูรณ์</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {symbol} - Price Chart
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {validData.length} data points
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={validData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="time"
            tickFormatter={(timestamp) => {
              const date = new Date(timestamp * 1000);
              return date.toLocaleString('th-TH', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
            }}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            yAxisId="price"
            domain={['auto', 'auto']}
            tickFormatter={(value) => formatNumber(value, 0)}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            yAxisId="volume"
            orientation="right"
            domain={[0, 'auto']}
            tickFormatter={(value) => formatNumber(value, 2)}
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            opacity={0.5}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Volume bars in background */}
          <Bar
            yAxisId="volume"
            dataKey="volume"
            fill="#3b82f6"
            opacity={0.2}
            name="Volume"
          />
          
          {/* Candlesticks */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="high"
            stroke="transparent"
            dot={false}
            shape={<CustomCandlestick />}
            name="Price"
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
