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
 * 获取股票代码列表
 */
export async function fetchStockCodes(): Promise<{ code: string; codeName: string }[]> {
  try {
    const response = await fetch(getApiUrl('/stocks/codes'), {
      // 添加超时和更宽松的错误处理
      signal: AbortSignal.timeout?.(5000) || undefined,
    });
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