// Bitkub API Types

export interface BitkubSymbol {
  id: number;
  symbol: string;
  info: string;
}

export interface BitkubSymbolsResponse {
  error: number;
  result: BitkubSymbol[];
}

export interface BitkubTickerData {
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

export interface BitkubTickerResponse {
  [key: string]: BitkubTickerData;
}

export interface CoinData {
  symbol: string;
  name: string;
  lastPrice: number;
  change24h: number;
  percentChange: number;
  volume: number;
  high24h: number;
  low24h: number;
  isFavorite?: boolean;
}
