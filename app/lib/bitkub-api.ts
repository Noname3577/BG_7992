import type { BitkubSymbolsResponse, BitkubTickerResponse, CoinData } from '@/types/bitkub';

const BITKUB_API_BASE = 'https://api.bitkub.com/api/v3';

export async function fetchBitkubSymbols(): Promise<BitkubSymbolsResponse> {
  try {
    const response = await fetch(`${BITKUB_API_BASE}/market/symbols`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch symbols');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Bitkub symbols:', error);
    throw error;
  }
}

export async function fetchBitkubTicker(): Promise<BitkubTickerResponse> {
  try {
    const response = await fetch(`${BITKUB_API_BASE}/market/ticker`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch ticker');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching Bitkub ticker:', error);
    throw error;
  }
}

export async function getCombinedMarketData(): Promise<CoinData[]> {
  try {
    const [symbolsData, tickerData] = await Promise.all([
      fetchBitkubSymbols(),
      fetchBitkubTicker(),
    ]);

    if (symbolsData.error !== 0) {
      throw new Error('Error in symbols response');
    }

    const combinedData = symbolsData.result
      .map((symbol) => {
        const ticker = tickerData[symbol.symbol];
        
        if (!ticker) {
          return null;
        }

        return {
          symbol: symbol.symbol,
          name: symbol.info,
          lastPrice: ticker.last,
          change24h: ticker.change,
          percentChange: ticker.percentChange,
          volume: ticker.baseVolume,
          high24h: ticker.high24hr,
          low24h: ticker.low24hr,
          isFavorite: false,
        } as CoinData;
      })
      .filter((item): item is CoinData => item !== null);

    return combinedData;
  } catch (error) {
    console.error('Error getting combined market data:', error);
    throw error;
  }
}
