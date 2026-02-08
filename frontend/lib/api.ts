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
 * 按日期获取股票数据（带分页）
 */
export async function fetchStocksByDate(
  date: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{
  data: StockData[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/stocks/date/${date}?page=${page}&pageSize=${pageSize}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stocks by date:', error);
    return {
      data: [],
      total: 0,
      page: 1,
      pageSize: pageSize,
      totalPages: 0,
    };
  }
}

/**
 * 获取最新股票数据（简化版，用于表格显示）
 */
export async function fetchSimplifiedStocks(
  date?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<{
  data: SimplifiedStock[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  if (date) {
    // 如果提供了日期，则按日期获取数据（带分页）
    const result = await fetchStocksByDate(date, page, pageSize);
    
    // 转换为简化格式
    const simplifiedData = result.data.map(stock => ({
      code: stock.code,
      name: stock.codeName || stock.code,
      price: stock.close || 0,
      change: stock.pctChg ? `${stock.pctChg > 0 ? '+' : ''}${stock.pctChg.toFixed(2)}%` : '0.00%',
      pe: stock.peTTM || 0,
      pb: stock.pbMRQ || 0,
      volume: stock.volume ? `${(stock.volume / 10000).toFixed(1)}万` : '0'
    }));

    return {
      data: simplifiedData,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
    };
  } else {
    // 否则获取所有数据（默认限制100条）
    const stocks = await fetchAllStocks();
    
    // 按日期分组，获取每个股票的最新数据
    const latestByCode: Record<string, StockData> = {};
    stocks.forEach(stock => {
      const existing = latestByCode[stock.code];
      if (!existing || new Date(stock.date) > new Date(existing.date)) {
        latestByCode[stock.code] = stock;
      }
    });

    // 转换为简化格式
    const simplifiedData = Object.values(latestByCode).map(stock => ({
      code: stock.code,
      name: stock.codeName || stock.code,
      price: stock.close || 0,
      change: stock.pctChg ? `${stock.pctChg > 0 ? '+' : ''}${stock.pctChg.toFixed(2)}%` : '0.00%',
      pe: stock.peTTM || 0,
      pb: stock.pbMRQ || 0,
      volume: stock.volume ? `${(stock.volume / 10000).toFixed(1)}万` : '0'
    }));

    // 对于非日期查询，我们仍然支持分页（前端分页）
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = simplifiedData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: simplifiedData.length,
      page,
      pageSize,
      totalPages: Math.ceil(simplifiedData.length / pageSize),
    };
  }
}