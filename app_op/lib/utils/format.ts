export const formatServerTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatNumber = (num: number | undefined, decimals: number = 2) => {
  if (num === undefined || num === null) return '-';
  return num.toLocaleString(undefined, { 
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals 
  });
};

export const convertSymbolFormat = (symbol: string) => {
  // Ticker API ใช้ THB_BTC แต่ Symbols API ใช้ BTC_THB
  // ต้องแปลง THB_BTC -> BTC_THB
  return symbol.startsWith('THB_') 
    ? symbol.replace('THB_', '') + '_THB'
    : symbol;
};
