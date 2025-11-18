import { useEffect, useState } from 'react';
import { TradingViewHistoryResponse, ChartDataPoint } from '@/types/market';

interface UseChartDataParams {
  symbol: string;
  resolution?: string;
  from?: number;
  to?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const useChartData = ({
  symbol,
  resolution = '60',
  from,
  to,
  autoRefresh = false,
  refreshInterval = 60000, // 1 minute default
}: UseChartDataParams) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = async () => {
    // ตรวจสอบว่า symbol มีค่าก่อนเรียก API
    if (!symbol || symbol.trim() === '') {
      console.error('❌ Symbol is empty or undefined');
      setError('กรุณาระบุ Symbol');
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({
        symbol: symbol.trim(),
        resolution,
      });

      if (from) params.append('from', from.toString());
      if (to) params.append('to', to.toString());

      console.log('🔄 Fetching chart data with params:', {
        symbol,
        resolution,
        from,
        to,
        url: `/api/chart?${params.toString()}`
      });

      const response = await fetch(`/api/chart?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error:', response.status, errorData);
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data: TradingViewHistoryResponse = await response.json();

      console.log('✅ Chart data received:', {
        status: data.s,
        dataPoints: data.t?.length || 0,
        firstTime: data.t?.[0] ? new Date(data.t[0] * 1000).toISOString() : 'N/A',
        lastTime: data.t?.[data.t.length - 1] ? new Date(data.t[data.t.length - 1] * 1000).toISOString() : 'N/A',
      });

      if (data.s !== 'ok') {
        throw new Error('API returned error status');
      }

      // ตรวจสอบว่ามีข้อมูลหรือไม่
      if (!data.t || data.t.length === 0) {
        console.warn('⚠️ No data returned from API');
        setChartData([]);
        setLoading(false);
        setError('ไม่มีข้อมูลในช่วงเวลานี้');
        return;
      }

      // แปลงข้อมูลเป็น array of objects
      const processedData: ChartDataPoint[] = data.t.map((timestamp, index) => ({
        time: timestamp,
        open: data.o[index],
        high: data.h[index],
        low: data.l[index],
        close: data.c[index],
        volume: data.v[index],
      }));

      setChartData(processedData);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching chart data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      setChartData([]);
    }
  };

  useEffect(() => {
    fetchChartData();

    if (autoRefresh) {
      const interval = setInterval(fetchChartData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [symbol, resolution, from, to, autoRefresh, refreshInterval]);

  return { chartData, loading, error, refetch: fetchChartData };
};
