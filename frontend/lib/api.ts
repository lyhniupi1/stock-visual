const API_BASE_URL = 'http://localhost:8080';

export interface StockData {
  code: string;
  date: string;
  codeName: string;
  open: number;
  high: number;
  low: number;
  close: number;
  preclose: number;
  volume: number;
  amount: number;
  adjustflag: number;
  turn: number;
  tradestatus: number;
  pctChg: number;
  peTTM: number;
  pbMRQ: number;
  psTTM: number;
  pcfNcfTTM: number;
  isST: number;
}

export interface SimplifiedStock {
  code: string;
  name: string;
  price: number;
  change: string;
  pe: number;
  pb: number;
  volume: string;
}

/**
 * 获取所有股票数据
 */
export async function fetchAllStocks(): Promise<StockData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stocks`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stocks:', error);
    return [];
  }
}

/**
 * 获取股票代码列表
 */
export async function fetchStockCodes(): Promise<{ code: string; codeName: string }[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stocks/codes`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stock codes:', error);
    return [];
  }
}

/**
 * 按日期获取股票数据
 */
export async function fetchStocksByDate(date: string): Promise<StockData[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stocks/date/${date}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stocks by date:', error);
    return [];
  }
}

/**
 * 获取最新股票数据（简化版，用于表格显示）
 */
export async function fetchSimplifiedStocks(date?: string): Promise<SimplifiedStock[]> {
  let stocks: StockData[];
  
  if (date) {
    // 如果提供了日期，则按日期获取数据
    stocks = await fetchStocksByDate(date);
  } else {
    // 否则获取所有数据（默认限制100条）
    stocks = await fetchAllStocks();
  }
  
  // 按日期分组，获取每个股票的最新数据
  const latestByCode: Record<string, StockData> = {};
  stocks.forEach(stock => {
    const existing = latestByCode[stock.code];
    if (!existing || new Date(stock.date) > new Date(existing.date)) {
      latestByCode[stock.code] = stock;
    }
  });

  // 转换为简化格式
  return Object.values(latestByCode).map(stock => ({
    code: stock.code,
    name: stock.codeName || stock.code,
    price: stock.close || 0,
    change: stock.pctChg ? `${stock.pctChg > 0 ? '+' : ''}${stock.pctChg.toFixed(2)}%` : '0.00%',
    pe: stock.peTTM || 0,
    pb: stock.pbMRQ || 0,
    volume: stock.volume ? `${(stock.volume / 10000).toFixed(1)}万` : '0'
  }));
}