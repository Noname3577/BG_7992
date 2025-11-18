import { useEffect, useState } from 'react';
import { TickerData, TickerResponse, ServerTime } from '@/types/market';

export const useMarketData = () => {
  const [tickers, setTickers] = useState<[string, TickerData][]>([]);
  const [serverTime, setServerTime] = useState<ServerTime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

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
      
      // ดึงข้อมูล Server Time ผ่าน API Route ของเราเอง
      const timeResponse = await fetch('/api/servertime', {
        cache: 'no-store',
      });
      const timeData = await timeResponse.json();
      
      // แปลง object เป็น array และกรองเฉพาะ THB pairs
      const tickerArray = Object.entries(tickerData)
        .filter(([symbol]) => symbol.startsWith('THB_'))
        .sort((a, b) => a[0].localeCompare(b[0]));
      
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

  return { tickers, serverTime, loading, error, lastUpdate };
};
