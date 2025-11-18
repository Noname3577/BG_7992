'use client';

import { useState } from 'react';
import { useMarketData } from '@/hooks/useMarketData';
import { useMarketSymbols } from '@/hooks/useMarketSymbols';
import { convertSymbolFormat } from '@/lib/utils/format';
import ServerTimeCard from '@/components/ServerTimeCard';
import MarketTable from '@/components/MarketTable';
import SymbolModal from '@/components/SymbolModal';
import StatusIndicator from '@/components/StatusIndicator';

const ITEMS_PER_PAGE = 10;

export default function Home() {
  const { tickers, serverTime, loading, error, lastUpdate } = useMarketData();
  const { symbolsInfo } = useMarketSymbols();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // กรองข้อมูลตามคำค้นหา
  const filteredTickers = tickers.filter(([symbol]) => 
    symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // คำนวณ pagination
  const totalPages = Math.ceil(filteredTickers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTickers = filteredTickers.slice(startIndex, endIndex);

  // รีเซ็ต page เมื่อค้นหา
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

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
          filteredTickers={paginatedTickers}
          totalTickers={tickers.length}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onRowClick={handleRowClick}
        />

        {/* Pagination Controls */}
        {filteredTickers.length > ITEMS_PER_PAGE && (
          <div className="mt-4 bg-white dark:bg-zinc-900 rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                แสดง {startIndex + 1}-{Math.min(endIndex, filteredTickers.length)} จาก {filteredTickers.length} รายการ
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← ก่อนหน้า
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // แสดงหน้าแรก, หน้าสุดท้าย, และหน้าใกล้เคียงกับหน้าปัจจุบัน
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white font-semibold'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return <span key={page} className="text-zinc-500 dark:text-zinc-500">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ถัดไป →
                </button>
              </div>
            </div>
          </div>
        )}

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
