export interface TickerData {
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

export interface TickerResponse {
  [symbol: string]: TickerData;
}

export interface ServerTime {
  [key: string]: number;
}

export interface SymbolInfo {
  symbol: string;
  name: string;
  description: string;
  status: string;
  base_asset: string;
  quote_asset: string;
  base_asset_scale: number;
  quote_asset_scale: number;
  price_scale: number;
  price_step: string;
  quantity_scale: number;
  quantity_step: string;
  min_quote_size: number;
  freeze_buy: boolean;
  freeze_sell: boolean;
  freeze_cancel: boolean;
  market_segment: string;
  pairing_id: number;
  buy_price_gap_as_percent: number;
  sell_price_gap_as_percent: number;
  source: string;
  created_at: string;
  modified_at: string;
}

export interface MarketSymbolsResponse {
  error: number;
  result: SymbolInfo[];
}
