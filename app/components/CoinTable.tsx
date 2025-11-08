'use client';

import { useState, useMemo } from 'react';
import type { CoinData } from '@/types/bitkub';

interface CoinTableProps {
  coins: CoinData[];
}

export default function CoinTable({ coins }: CoinTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CoinData;
    direction: 'asc' | 'desc';
  }>({ key: 'symbol', direction: 'asc' });

  const toggleFavorite = (symbol: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(symbol)) {
        newFavorites.delete(symbol);
      } else {
        newFavorites.add(symbol);
      }
      return newFavorites;
    });
  };

  const handleSort = (key: keyof CoinData) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredAndSortedCoins = useMemo(() => {
    let filtered = coins.filter((coin) => {
      const matchesSearch =
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFavorites = !showFavoritesOnly || favorites.has(coin.symbol);
      return matchesSearch && matchesFavorites;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [coins, searchTerm, showFavoritesOnly, favorites, sortConfig]);

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatVolume = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toFixed(2);
  };

  return (
    <div className="w-full">
      {/* Search and Filter Controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by symbol or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            showFavoritesOnly
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          ⭐ Favorites {favorites.size > 0 && `(${favorites.size})`}
        </button>
      </div>

      {/* Coin Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Fav
              </th>
              <th
                onClick={() => handleSort('symbol')}
                className="cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Symbol {sortConfig.key === 'symbol' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                Name
              </th>
              <th
                onClick={() => handleSort('lastPrice')}
                className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Last Price {sortConfig.key === 'lastPrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('percentChange')}
                className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                24h Change {sortConfig.key === 'percentChange' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th
                onClick={() => handleSort('volume')}
                className="cursor-pointer px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Volume {sortConfig.key === 'volume' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                24h High
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                24h Low
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedCoins.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {showFavoritesOnly && favorites.size === 0
                    ? 'No favorites yet. Click the star icon to add favorites.'
                    : 'No coins found.'}
                </td>
              </tr>
            ) : (
              filteredAndSortedCoins.map((coin) => (
                <tr
                  key={coin.symbol}
                  className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleFavorite(coin.symbol)}
                      className="text-xl transition-transform hover:scale-110"
                    >
                      {favorites.has(coin.symbol) ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold text-gray-900 dark:text-white">
                    {coin.symbol}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {coin.name}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-medium text-gray-900 dark:text-white">
                    {formatNumber(coin.lastPrice)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm font-medium">
                    <div className="flex flex-col items-end">
                      <span
                        className={
                          coin.percentChange >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }
                      >
                        {coin.percentChange >= 0 ? '+' : ''}
                        {formatNumber(coin.percentChange)}%
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {coin.change24h >= 0 ? '+' : ''}
                        {formatNumber(coin.change24h)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-gray-700 dark:text-gray-300">
                    {formatVolume(coin.volume)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-gray-700 dark:text-gray-300">
                    {formatNumber(coin.high24h)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm text-gray-700 dark:text-gray-300">
                    {formatNumber(coin.low24h)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Stats */}
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredAndSortedCoins.length} of {coins.length} coins
      </div>
    </div>
  );
}
