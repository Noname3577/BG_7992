'use client';

import { useState } from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { useMarketSymbols } from '@/hooks/useMarketSymbols';
import { convertSymbolFormat } from '@/lib/utils/format';
import ServerTimeCard from '@/components/ServerTimeCard';
import MarketTable from '@/components/MarketTable';
import SymbolModal from '@/components/SymbolModal';
import StatusIndicator from '@/components/StatusIndicator';

export default function Home() {
  const { tickers, serverTime, loading, error, lastUpdate } = useMarketData();
  const { symbolsInfo } = useMarketSymbols();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // กรองข้อมูลตามคำค้นหา
  const filteredTickers = tickers.filter(([symbol]) => 
    symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (symbol: string) => {
    setSelectedSymbol(symbol);
    setShowModal(true);
  };

  const getSymbolInfo = (symbol: string) => {
    const convertedSymbol = convertSymbolFormat(symbol);
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
        
        <ServerTimeCard serverTime={serverTime} lastUpdate={lastUpdate} />

        <MarketTable
          filteredTickers={filteredTickers}
          totalTickers={tickers.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRowClick={handleRowClick}
        />

        <StatusIndicator lastUpdate={lastUpdate} />
      </div>

      <SymbolModal
        show={showModal}
        symbol={selectedSymbol}
        symbolInfo={selectedSymbol ? getSymbolInfo(selectedSymbol) : undefined}
        tickerData={selectedSymbol ? tickers.find(([sym]) => sym === selectedSymbol)?.[1] : undefined}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
