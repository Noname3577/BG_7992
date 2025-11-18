import { useEffect, useState } from 'react';
import { SymbolInfo, MarketSymbolsResponse } from '@/types/market';

export const useMarketSymbols = () => {
  const [symbolsInfo, setSymbolsInfo] = useState<Map<string, SymbolInfo>>(new Map());

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

  useEffect(() => {
    fetchMarketSymbols();
  }, []);

  return { symbolsInfo };
};
