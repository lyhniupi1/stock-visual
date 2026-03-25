/**
 * API基础URL配置
 * 开发环境：通过Next.js代理配置，使用相对路径 /api
 * 生产环境：使用相对路径 /api，由nginx代理到后端
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const BACKEND_URL = process.env.NEXT_BACKEND_URL || '';


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
  dividendYield?: number;
  eps?: number;
  dividendPayRatio?: number;
  predictDividendRatio?: number;
}

export interface SimplifiedStock {
  code: string;
  name: string;
  price: number;
  change: string;
  pe: number;
  pb: number;
  volume: string;
  dividendYield: string;
  eps?: number;
  dividendPayRatio?: number;
  predictDividendRatio?: number;
}

export interface IndexValuationData {
  code: string;
  date: string;
  codeName: string;
  pe: number;
  pb: number;
  roe: number;
}

export interface Hushen300Data {
  date: string;
  code: string;
  open: number;
  high: number;
  low: number;
  close: number;
  preclose: number;
  volume: number;
  amount: number;
  pctChg: number;
}

/**
 * 获取完整的API URL
 * - 在客户端组件中：使用相对路径 /api，由Next.js代理处理
 * - 在服务端组件中：使用完整的后端URL（如 http://localhost:8080/api）
 * - 如果设置了 NEXT_PUBLIC_API_URL 环境变量，则优先使用
 *
 * @param path API路径，如 '/stocks' 或 '/stocks/codes'
 * @returns 完整的API URL
 */
export function getApiUrl(path: string): string {
  // 移除路径开头的斜杠（如果有），确保拼接正确
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // 如果设置了环境变量，直接使用
  if (API_BASE_URL) {
    return `${API_BASE_URL}/api/${cleanPath}`;
  }
  
  // 检测是否在浏览器环境中
  const isClient = typeof window !== 'undefined';
  
  if (isClient) {
    // 客户端组件：使用相对路径，由Next.js代理处理
    return `/api/${cleanPath}`;
  } else {
    // 服务端组件：直接访问后端
    // 开发环境默认使用 localhost:8080，生产环境由nginx代理
    const backendBaseUrl = process.env.NODE_ENV === 'development'
      ? `${BACKEND_URL}`
      : `${BACKEND_URL}`; // 生产环境使用相对路径，由nginx代理
    
    if (backendBaseUrl) {
      return `${backendBaseUrl}/api/${cleanPath}`;
    } else {
      // 生产环境或未配置时，也使用相对路径
      return `/api/${cleanPath}`;
    }
  }
}

/**
 * 获取所有股票数据
 */
export async function fetchAllStocks(): Promise<StockData[]> {
  try {
    const response = await fetch(getApiUrl('/stocks'));
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
 * 创建带超时的fetch请求
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 获取股票代码列表
 */
export async function fetchStockCodes(): Promise<{ code: string; codeName: string }[]> {
  try {
    const response = await fetchWithTimeout(getApiUrl('/stocks/codes'), {}, 5000);
    if (!response.ok) {
      // 不抛出错误，而是返回空数组
      console.warn(`Failed to fetch stock codes: HTTP ${response.status}`);
      return [];
    }
    return await response.json();
  } catch (error) {
    // 静默处理错误，不打印到控制台
    return [];
  }
}

/**
 * 搜索股票（模糊匹配代码或名称）
 */
export async function searchStocks(
  query: string,
  limit: number = 20
): Promise<{ code: string; codeName: string }[]> {
  try {
    if (!query.trim()) {
      return [];
    }
    
    const response = await fetchWithTimeout(
      getApiUrl(`/stocks/search?q=${encodeURIComponent(query)}&limit=${limit}`),
      {},
      5000
    );
    
    if (!response.ok) {
      console.warn(`Failed to search stocks: HTTP ${response.status}`);
      return [];
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching stocks:', error);
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
      getApiUrl(`/stocks/date/${date}?page=${page}&pageSize=${pageSize}`)
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
 * 获取股票历史数据（用于K线图）
 */
export async function fetchStockHistory(code: string, limit: number = 365): Promise<StockData[]> {
  try {
    const response = await fetch(
      getApiUrl(`/stocks/${code}/history?limit=${limit}`)
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stock history:', error);
    return [];
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
      volume: stock.volume ? `${(stock.volume / 10000).toFixed(1)}万` : '0',
      dividendYield: stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : '0.00%',
      eps: stock.eps || 0,
      dividendPayRatio: stock.dividendPayRatio || 0,
      predictDividendRatio: stock.predictDividendRatio || 0
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
      volume: stock.volume ? `${(stock.volume / 10000).toFixed(1)}万` : '0',
      dividendYield: stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : '0.00%'
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

export interface StockBonusData {
  code: string;
  dateStr: string;
  codeName: string | null;
  bonusData: string | null;
  amount: number | null;
  stockDividend: number | null;
}

/**
 * 获取股票分红数据
 * @param code 股票代码
 * @returns 股票分红数据列表
 */
export async function fetchStockBonusData(code: string): Promise<StockBonusData[]> {
  try {
    const response = await fetch(getApiUrl(`/stocks/${code}/bonus`));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch stock bonus data:', error);
    return [];
  }
}

/**
 * 获取股票最新分红数据
 * @param code 股票代码
 * @returns 最新分红数据或null
 */
export async function fetchLatestStockBonusData(code: string): Promise<StockBonusData | null> {
  try {
    const response = await fetch(getApiUrl(`/stocks/${code}/bonus/latest`));
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch latest stock bonus data:', error);
    return null;
  }
}

// ==================== Portfolio API ====================

export interface PortfolioStock {
  code: string;
  name: string;
  quantity: number;
  costPrice: number;
}

export interface Portfolio {
  id: number;
  name: string;
  stockCount: number;
  stocks: PortfolioStock[];
  createdAt: string;
  initialValue: number;
  currentValue: number;
  profitPercent: number;
}

export interface CreatePortfolioDto {
  name: string;
  stocks: PortfolioStock[];
  createdAt: string;
}

export interface UpdatePortfolioDto {
  name?: string;
  stocks?: PortfolioStock[];
}

/**
 * 获取所有组合列表
 */
export async function getPortfolios(): Promise<Portfolio[]> {
  try {
    const response = await fetch(getApiUrl('/portfolios'));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch portfolios:', error);
    throw error;
  }
}

/**
 * 根据ID获取组合详情
 */
export async function getPortfolioById(id: number): Promise<Portfolio> {
  try {
    const response = await fetch(getApiUrl(`/portfolios/${id}`));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch portfolio:', error);
    throw error;
  }
}

/**
 * 创建新组合
 */
export async function createPortfolio(dto: CreatePortfolioDto): Promise<Portfolio> {
  try {
    const response = await fetch(getApiUrl('/portfolios'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to create portfolio:', error);
    throw error;
  }
}

/**
 * 更新组合
 */
export async function updatePortfolio(id: number, dto: UpdatePortfolioDto): Promise<Portfolio> {
  try {
    const response = await fetch(getApiUrl(`/portfolios/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dto),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to update portfolio:', error);
    throw error;
  }
}

/**
 * 删除组合
 */
export async function deletePortfolio(id: number): Promise<void> {
  try {
    const response = await fetch(getApiUrl(`/portfolios/${id}`), {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    console.error('Failed to delete portfolio:', error);
    throw error;
  }
}

// ==================== Batch Stock API ====================

/**
 * 批量获取多个股票在指定日期范围内的数据
 * @param codes 股票代码数组
 * @param startDate 开始日期 (YYYY-MM-DD)
 * @param endDate 结束日期 (YYYY-MM-DD)
 * @returns 每个股票对应的数据映射
 */
export async function fetchMultipleStocksByDateRange(
  codes: string[],
  startDate: string,
  endDate: string
): Promise<Record<string, StockData[]>> {
  try {
    const response = await fetch(getApiUrl('/stocks/batch/range'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ codes, startDate, endDate }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch multiple stocks by date range:', error);
    return {};
  }
}

/**
 * 批量获取多个股票在指定日期（或之前最近日期）的数据
 * @param codes 股票代码数组
 * @param date 目标日期 (YYYY-MM-DD)
 * @returns 每个股票对应的数据映射
 */
export async function fetchMultipleStocksByDate(
  codes: string[],
  date: string
): Promise<Record<string, StockData | null>> {
  try {
    const response = await fetch(getApiUrl('/stocks/batch/date'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ codes, date }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch multiple stocks by date:', error);
    return {};
  }
}

/**
 * 一次性批量获取多个股票在两个日期（t1和t2）的数据
 * @param codes 股票代码数组
 * @param t1 开始日期 (YYYY-MM-DD)
 * @param t2 结束日期 (YYYY-MM-DD)
 * @returns 每个股票在t1和t2的数据映射 { code: { t1: data, t2: data } }
 */
export async function fetchMultipleStocksByTwoDates(
  codes: string[],
  t1: string,
  t2: string
): Promise<Record<string, { t1: StockData | null; t2: StockData | null }>> {
  try {
    const response = await fetch(getApiUrl('/stocks/batch/compare'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ codes, t1, t2 }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch multiple stocks by two dates:', error);
    return {};
  }
}

/**
 * 获取指数估值数据
 * @param code 指数代码（可选，不传则获取所有指数数据）
 * @param limit 限制返回的数据条数（可选，0表示无限制）
 */
export async function fetchIndexValuationData(
  code?: string,
  limit: number = 0
): Promise<IndexValuationData[]> {
  try {
    const params = new URLSearchParams();
    if (code) params.append('code', code);
    if (limit > 0) params.append('limit', limit.toString());
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(getApiUrl(`/stocks/index/valuation${queryString}`));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch index valuation data:', error);
    return [];
  }
}

/**
 * 获取所有指数代码
 */
export async function fetchIndexCodes(): Promise<{ code: string; codeName: string }[]> {
  try {
    const response = await fetch(getApiUrl('/stocks/index/codes'));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch index codes:', error);
    return [];
  }
}

/**
 * 获取指数估值数据的时间范围
 * @param code 指数代码（可选）
 */
export async function fetchIndexValuationDateRange(
  code?: string
): Promise<{ minDate: string; maxDate: string }> {
  try {
    const params = new URLSearchParams();
    if (code) params.append('code', code);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await fetch(getApiUrl(`/stocks/index/date-range${queryString}`));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch index valuation date range:', error);
    return { minDate: '', maxDate: '' };
  }
}

// ==================== 沪深300指数 API ====================

/**
 * 获取沪深300指数数据（根据日期范围）
 * @param startDate 开始日期 (YYYY-MM-DD)
 * @param endDate 结束日期 (YYYY-MM-DD)
 */
export async function fetchHushen300ByDateRange(
  startDate: string,
  endDate: string
): Promise<Hushen300Data[]> {
  try {
    const params = new URLSearchParams();
    params.append('start', startDate);
    params.append('end', endDate);

    const response = await fetch(getApiUrl(`/valuation/hushen300?${params.toString()}`));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch hushen300 data by date range:', error);
    return [];
  }
}

/**
 * 获取沪深300指数最新数据
 */
export async function fetchLatestHushen300Data(): Promise<Hushen300Data | null> {
  try {
    const response = await fetch(getApiUrl('/valuation/hushen300/latest'));
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch latest hushen300 data:', error);
    return null;
  }
}

/**
 * 股息支付率数据接口
 */
export interface DividendRatioData {
  code: string;
  date: string;
  codeName: string;
  dividendPayRatio: number | null;
  dividendImple: number | null;
  parentNetProfit: number | null;
}

/**
 * 获取股票的股息支付率历史数据
 * @param code 股票代码
 * @returns 股息支付率数据列表
 */
export async function fetchDividendRatioHistory(code: string): Promise<DividendRatioData[]> {
  try {
    const response = await fetch(getApiUrl(`/stocks/${code}/dividend-ratio`));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch dividend ratio data:', error);
    return [];
  }
}

/**
 * 获取最新的股息支付率数据
 * @param code 股票代码
 * @returns 最新股息支付率数据或null
 */
export async function fetchLatestDividendRatio(code: string): Promise<DividendRatioData | null> {
  try {
    const response = await fetch(getApiUrl(`/stocks/${code}/dividend-ratio/latest`));
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch latest dividend ratio data:', error);
    return null;
  }
}

// ==================== EPS 预测数据 API ====================

/**
 * EPS 预测数据接口
 */
export interface EpsPredictData {
  secucode: string;
  securityNameAbbr: string;
  orgNameAbbr: string;
  year1: string;
  yearMark1: string;
  eps1: number | null;
  pe1: number | null;
  year2: string;
  yearMark2: string;
  eps2: number | null;
  pe2: number | null;
  year3: string;
  yearMark3: string;
  eps3: number | null;
  pe3: number | null;
  year4: string;
  yearMark4: string;
  eps4: number | null;
  pe4: number | null;
}

/**
 * 获取股票的 EPS 预测数据
 * @param code 股票代码
 * @returns EPS 预测数据列表
 */
export async function fetchEpsPredictData(code: string): Promise<EpsPredictData[]> {
  try {
    const response = await fetch(getApiUrl(`/stocks/${code}/eps-predict`));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch EPS predict data:', error);
    return [];
  }
}

/**
 * 获取最新的 EPS 预测数据（按机构分组的最新预测）
 * @param code 股票代码
 * @returns 最新 EPS 预测数据列表
 */
export async function fetchLatestEpsPredictData(code: string): Promise<EpsPredictData[]> {
  try {
    const response = await fetch(getApiUrl(`/stocks/${code}/eps-predict/latest`));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch latest EPS predict data:', error);
    return [];
  }
}

/**
 * 获取沪深300指数历史数据
 * @param limit 限制返回的数据条数（默认365条）
 */
export async function fetchHushen300History(
  limit: number = 365
): Promise<Hushen300Data[]> {
  try {
    const response = await fetch(getApiUrl(`/valuation/hushen300/history?limit=${limit}`));
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch hushen300 history:', error);
    return [];
  }
}