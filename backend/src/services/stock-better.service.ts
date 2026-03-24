import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { StockDayPepbData } from '../entities/stock-day-pepb-data.entity';
import { StockBonusData } from '../entities/stock-bonus-data.entity';
import { IndexValuationData } from '../entities/index-valuation-data.entity';
import { Hushen300 } from '../entities/hushen300.entity';
import { DividendRatioData } from '../entities/eastmoney-dividend-ratio.entity';

// 定义数据库查询返回的股票数据接口（与实体兼容）
export interface StockDayPepbDataRecord extends StockDayPepbData {
  id?: number;
  dividendYield?: number;
  eps?: number;
  dividendPayRatio?: number;
  predictDividendRatio?: number;
}

// 定义数据库查询返回的分红数据接口（与实体兼容）
export interface StockBonusDataRecord extends StockBonusData {
  id?: number;
}

@Injectable()
export class StockBetterService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * 将股票代码从 "sh.600000" 格式转换为 "600000.SH" 格式
   * 用于匹配 eastmoney 表中的 SECUCODE 格式
   */
  private convertToEastmoneyCode(code: string): string {
    if (!code) return '';
    
    // 格式: "sh.600000" 或 "sz.000001"
    const parts = code.split('.');
    if (parts.length === 2) {
      const exchange = parts[0].toUpperCase(); // "SH" 或 "SZ"
      const stockCode = parts[1]; // "600000"
      return `${stockCode}.${exchange}`;
    }
    
    // 如果已经是 "600000.SH" 格式，直接返回
    return code;
  }

  /**
   * 将股票代码从 "600000.SH" 格式转换回 "sh.600000" 格式
   */
  private convertFromEastmoneyCode(secucode: string): string {
    if (!secucode) return '';
    
    // 格式: "600000.SH" 或 "000001.SZ"
    const parts = secucode.split('.');
    if (parts.length === 2) {
      const stockCode = parts[0]; // "600000"
      const exchange = parts[1].toLowerCase(); // "sh" 或 "sz"
      return `${exchange}.${stockCode}`;
    }
    
    // 如果已经是 "sh.600000" 格式，直接返回
    return secucode;
  }

  /**
   * 获取所有股票数据
   */
  async findAll(limit: number = 100): Promise<StockDayPepbData[]> {
    const sql = `
      SELECT * FROM stock_day_pepb_data 
      ORDER BY date DESC 
      LIMIT ?
    `;
    return this.databaseService.query<StockDayPepbData>(sql, [limit]);
  }

  /**
   * 根据股票代码查询数据
   */
  async findByCode(code: string, limit: number = 100): Promise<StockDayPepbData[]> {
    const sql = `
      SELECT * FROM stock_day_pepb_data 
      WHERE code = ? 
      ORDER BY date DESC 
      LIMIT ?
    `;
    return this.databaseService.query<StockDayPepbData>(sql, [code, limit]);
  }

  /**
   * 根据股票代码和日期范围查询数据
   */
  async findByCodeAndDateRange(
    code: string,
    startDate: string,
    endDate: string,
  ): Promise<StockDayPepbData[]> {
    const sql = `
      SELECT * FROM stock_day_pepb_data 
      WHERE code = ? 
        AND date >= ? 
        AND date <= ? 
      ORDER BY date ASC
    `;
    return this.databaseService.query<StockDayPepbData>(sql, [code, startDate, endDate]);
  }

  /**
   * 获取所有股票代码
   */
  async getStockCodes(): Promise<{ code: string; codeName: string }[]> {
    const sql = `
      SELECT DISTINCT code, codeName 
      FROM stockinfo 
      WHERE codeName IS NOT NULL 
      ORDER BY code
    `;
    const results = await this.databaseService.query<any>(sql);
    
    return results.map(row => ({
      code: row.code,
      codeName: row.codeName,
    }));
  }

  /**
   * 搜索股票（模糊匹配代码或名称）
   */
  async searchStocks(query: string, limit: number = 20): Promise<{ code: string; codeName: string }[]> {
    if (!query.trim()) {
      return [];
    }

    const searchTerm = `%${query}%`;
    // 优化查询：使用UNION分别搜索代码和名称，避免OR条件导致索引失效
    const sql = `
      SELECT DISTINCT code, codeName
      FROM (
        -- 搜索代码匹配
        SELECT code, codeName
        FROM stockinfo
        WHERE code LIKE ?
        UNION
        -- 搜索名称匹配
        SELECT code, codeName
        FROM stockinfo
        WHERE codeName LIKE ? AND codeName IS NOT NULL
      )
      ORDER BY code
      LIMIT ?
    `;
    const results = await this.databaseService.query<any>(sql, [searchTerm, searchTerm, limit]);
    
    return results.map(row => ({
      code: row.code,
      codeName: row.codeName,
    }));
  }

  /**
   * 获取股票最新数据
   */
  async getLatestStockData(code: string): Promise<StockDayPepbData | null> {
    const sql = `
      SELECT * FROM stock_day_pepb_data 
      WHERE code = ? 
      ORDER BY date DESC 
      LIMIT 1
    `;
    return this.databaseService.queryOne<StockDayPepbData>(sql, [code]);
  }

  /**
   * 根据日期查询股票数据（带分页和排名）
   */
  async findByDate(
    date: string, 
    page: number = 1, 
    pageSize: number = 20
  ): Promise<{
    data: StockDayPepbDataRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    // 首先获取该日期的所有股票数据
    const allStocks = await this.databaseService.query<StockDayPepbData>(
      'SELECT * FROM stock_day_pepb_data WHERE date = ?',
      [date]
    );

    if (allStocks.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    // 分离PE/PB为负数的股票
    const negativePEStocks = allStocks.filter(stock => (stock.peTTM || 0) < 0);
    const negativePBStocks = allStocks.filter(stock => (stock.pbMRQ || 0) < 0);
    
    // 正数PE股票（用于排名）
    const positivePEStocks = allStocks.filter(stock => (stock.peTTM || 0) >= 0);
    // 正数PB股票（用于排名）
    const positivePBStocks = allStocks.filter(stock => (stock.pbMRQ || 0) >= 0);

    // 计算PE排名（只对正数PE排序）
    const peSorted = [...positivePEStocks].sort((a, b) => (a.peTTM || Infinity) - (b.peTTM || Infinity));
    // 计算PB排名（只对正数PB排序）
    const pbSorted = [...positivePBStocks].sort((a, b) => (a.pbMRQ || Infinity) - (b.pbMRQ || Infinity));

    // 计算每个股票的股息率排名
    // 根据查询日期动态确定分红统计年份范围
    const queryDate = new Date(date);
    const queryYear = queryDate.getFullYear();
    const queryMonth = queryDate.getMonth() + 1; // 月份从0开始，所以要+1
    console.log(queryYear)
    console.log(queryMonth)
    // 判断日期在当年上半年还是下半年，确定统计年份范围
    const isSecondHalfYear = queryMonth >= 5; // 7-12月为下半年
    const dividendYearThreshold = isSecondHalfYear ? queryYear - 1 : queryYear - 2;

    // 获取所有股票的分红汇总数据（根据动态年份阈值）
    const bonusSummarySql = `
      SELECT
        code,
        SUM(amount) as totalAmount,
        SUM(stockDividend) as totalStockDividend
      FROM stock_bonus_data
      WHERE dateStr > ?
      GROUP BY code
    `;
    const bonusSummaries = this.databaseService.query<any>(bonusSummarySql, [dividendYearThreshold.toString()]);

    // 创建分红汇总映射
    const bonusMap = new Map<string, { totalAmount: number; totalStockDividend: number }>();
    for (const summary of bonusSummaries) {
      bonusMap.set(summary.code, {
        totalAmount: summary.totalAmount || 0,
        totalStockDividend: summary.totalStockDividend || 0,
      });
    }

    // 计算股息率并添加到股票对象
    const stocksWithDividendYield = allStocks.map(stock => {
      const bonus = bonusMap.get(stock.code);
      const closePrice = stock.close || 0;
      let dividendYield = 0;

      if (bonus && closePrice > 0) {
        // 股息率 = 每股分红金额 / 股价 + 每股送股
        dividendYield = (bonus.totalAmount / closePrice) + (bonus.totalStockDividend || 0);
      }

      return {
        ...stock,
        dividendYield,
      };
    });


    // 1. 查询date当年所有股票的EPS，得到一个map
    const epsQueryYear = queryYear.toString();
    const epsSql = `
      SELECT SECUCODE, EPS
      FROM eastmoney_eps_predict
      WHERE YEAR = ?
    `;
    const epsResults = await this.databaseService.query<any>(epsSql, [epsQueryYear]);

    
    
    // 创建EPS映射（key: 转换后的代码格式 "sh.600000"）
    const epsMap = new Map<string, number>();
    for (const row of epsResults) {
      const eastmoneyCode = row.SECUCODE;
      const localCode = this.convertFromEastmoneyCode(eastmoneyCode);
      const eps = parseFloat(row.EPS) || 0;
      if (localCode && eps > 0) {
        epsMap.set(localCode, eps);
      }
    }

    // 2. 查询date前三年的平均股息支付率，得到一个map2
    // 计算前三年的起始日期（date的前三年）
    const threeYearsAgo = new Date(queryDate);
    threeYearsAgo.setFullYear(queryYear - 3);
    const startDateStr = threeYearsAgo.toISOString().split('T')[0];
    
    // 结束日期为查询日期（date）
    const endDateStr = date;

    
    const dividendRatioSql = `
      SELECT SECUCODE, avg(DIVIDEND_PAY_IMPLE) as avgDividendPayRatio
      FROM eastmoney_dividend_ratio
      WHERE REPORT_DATE >= ? and REPORT_DATE < ?
      GROUP BY SECUCODE
    `;
    const dividendRatioResults = await this.databaseService.query<any>(dividendRatioSql, [startDateStr, endDateStr]);
    
    // 创建股息支付率映射（key: 转换后的代码格式 "sh.600000"）
    const dividendRatioMap = new Map<string, number>();
    for (const row of dividendRatioResults) {
      const eastmoneyCode = row.SECUCODE;
      const localCode = this.convertFromEastmoneyCode(eastmoneyCode);
      const avgDividendPayRatio = parseFloat(row.avgDividendPayRatio) || 0;
      if (localCode && avgDividendPayRatio > 0) {
        dividendRatioMap.set(localCode, avgDividendPayRatio);
      }
    }


    // 3. 计算预测股息率并添加到股票对象
    const stocksWithPredictDividend = stocksWithDividendYield.map(stock => {
      const eps = epsMap.get(stock.code) || 0;
      const dividendPayRatio = dividendRatioMap.get(stock.code) || 0;
      const closePrice = stock.close || 0;
      let predictDividendRatio = 0;

      if (eps > 0 && dividendPayRatio > 0 && closePrice > 0) {
        // predict_dividend_ratio = eps * 股息支付率 / price
        // 注意：股息支付率是百分比，需要除以100
        predictDividendRatio = (eps * (dividendPayRatio / 100)) / closePrice;
      }

      return {
        ...stock,
        eps,
        dividendPayRatio,
        predictDividendRatio,
      };
    });

    // 对股息率进行排序（降序，股息率越高越好）
    const dvSorted = [...stocksWithPredictDividend].sort((a, b) => b.dividendYield - a.dividendYield);

    // 创建股息率排名映射
    const dvRankMap = new Map<string, number>();
    dvSorted.forEach((stock, index) => {
      dvRankMap.set(stock.code, index + 1);
    });

    // 创建针对 predictDividendRatio 的排名映射
    // 对预测股息率进行排序（降序，预测股息率越高越好）
    const pdSorted = [...stocksWithPredictDividend].sort((a, b) => b.predictDividendRatio - a.predictDividendRatio);
    const pdRankMap = new Map<string, number>();
    pdSorted.forEach((stock, index) => {
      pdRankMap.set(stock.code, index + 1);
    });



    // 创建排名映射
    const peRankMap = new Map<string, number>();
    const pbRankMap = new Map<string, number>();

    // 正数PE股票获得正常排名
    peSorted.forEach((stock, index) => {
      peRankMap.set(stock.code, index + 1);
    });

    // 正数PB股票获得正常排名
    pbSorted.forEach((stock, index) => {
      pbRankMap.set(stock.code, index + 1);
    });

    // 计算综合排名（PE排名 + PB排名 + 股息率排名 + 预测股息率排名）
    const stocksWithRank = stocksWithPredictDividend.map(stock => {
      // PE为负数的排名设为9999
      const peRank = (stock.peTTM || 0) < 0 ? 9999 : (peRankMap.get(stock.code) || (positivePEStocks.length + 1));
      // PB为负数的排名设为9999
      const pbRank = (stock.pbMRQ || 0) < 0 ? 9999 : (pbRankMap.get(stock.code) || (positivePBStocks.length + 1));
      // 股息率小于等于0的排名设为较差排名（dvSorted.length + 1）
      const dvRank = (stock.dividendYield || 0) <= 0 ? (dvSorted.length + 1) : (dvRankMap.get(stock.code) || (dvSorted.length + 1));
      // 预测股息率小于等于0的排名设为较差排名（pdSorted.length + 1）
      const pdRank = (stock.predictDividendRatio || 0) <= 0 ? (pdSorted.length + 1) : (pdRankMap.get(stock.code) || (pdSorted.length + 1));

      return {
        ...stock,
        peRank,
        pbRank,
        dvRank,
        pdRank,
        totalRank: peRank + pbRank  + pdRank,
      };
    });

    // 按综合排名升序排序
    stocksWithRank.sort((a, b) => a.totalRank - b.totalRank);

    // 分页
    const total = stocksWithRank.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = stocksWithRank.slice(startIndex, endIndex);

    // 移除排名字段，返回原始数据结构（保留dividendYield字段）
    const data = paginatedData.map(({ peRank, pbRank, dvRank, pdRank, totalRank, ...stock }) => stock);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * 获取股票历史数据
   */
  async getStockHistory(code: string, limit: number = 365): Promise<StockDayPepbData[]> {
    if (limit === 0) {
      // 返回全部数据（按升序）
      const sql = `
        SELECT * FROM stock_day_pepb_data 
        WHERE code = ? 
        ORDER BY date ASC
      `;
      return this.databaseService.query<StockDayPepbData>(sql, [code]);
    }
    
    // 获取最近的数据（按降序）
    const sql = `
      SELECT * FROM stock_day_pepb_data 
      WHERE code = ? 
      ORDER BY date DESC 
      LIMIT ?
    `;
    const recentData = await this.databaseService.query<StockDayPepbData>(sql, [code, limit]);
    
    // 然后按升序排序返回
    return recentData.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * 获取股票分红数据
   */
  async getStockBonusData(code: string): Promise<StockBonusData[]> {
    const sql = `
      SELECT * FROM stock_bonus_data 
      WHERE code = ? 
      ORDER BY dateStr DESC
    `;
    return this.databaseService.query<StockBonusData>(sql, [code]);
  }

  /**
   * 获取股票最新分红数据
   */
  async getLatestStockBonusData(code: string): Promise<StockBonusData | null> {
    const sql = `
      SELECT * FROM stock_bonus_data 
      WHERE code = ? 
      ORDER BY dateStr DESC 
      LIMIT 1
    `;
    return this.databaseService.queryOne<StockBonusData>(sql, [code]);
  }

  /**
   * 批量查询多个股票在指定日期范围内的数据
   */
  async findMultipleStocksByDateRange(
    codes: string[],
    startDate: string,
    endDate: string,
  ): Promise<Map<string, StockDayPepbData[]>> {
    const result = new Map<string, StockDayPepbData[]>();
    
    if (codes.length === 0) {
      return result;
    }

    const placeholders = codes.map(() => '?').join(',');
    const sql = `
      SELECT * FROM stock_day_pepb_data 
      WHERE date >= ? 
        AND date <= ? 
        AND code IN (${placeholders})
      ORDER BY code ASC, date ASC
    `;
    
    const params = [startDate, endDate, ...codes];
    const stocks = await this.databaseService.query<StockDayPepbData>(sql, params);

    // 按股票代码分组
    for (const stock of stocks) {
      if (!result.has(stock.code)) {
        result.set(stock.code, []);
      }
      result.get(stock.code)!.push(stock);
    }

    return result;
  }

  /**
   * 获取多个股票在指定日期的最新数据
   */
  async findMultipleStocksByDate(
    codes: string[],
    date: string,
  ): Promise<Map<string, StockDayPepbData | null>> {
    const result = new Map<string, StockDayPepbData | null>();
    
    if (codes.length === 0) {
      return result;
    }

    // 使用窗口函数一次性查询所有股票的最新数据
    const placeholders = codes.map(() => '?').join(',');
    const sql = `
      WITH ranked AS (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY code ORDER BY date DESC) as rn
        FROM stock_day_pepb_data
        WHERE date <= ? 
          AND code IN (${placeholders})
      )
      SELECT * FROM ranked WHERE rn = 1
    `;
    
    const params = [date, ...codes];
    const stocks = await this.databaseService.query<StockDayPepbData>(sql, params);

    // 填充结果
    for (const code of codes) {
      result.set(code, null);
    }
    
    for (const stock of stocks) {
      result.set(stock.code, stock);
    }

    return result;
  }

  /**
   * 批量获取多个股票在两个日期（t1和t2）的数据
   */
  async findMultipleStocksByTwoDates(
    codes: string[],
    t1: string,
    t2: string,
  ): Promise<Map<string, { t1: StockDayPepbData | null; t2: StockDayPepbData | null }>> {
    const result = new Map<string, { t1: StockDayPepbData | null; t2: StockDayPepbData | null }>();
    
    if (codes.length === 0) {
      return result;
    }

    // 初始化结果
    for (const code of codes) {
      result.set(code, { t1: null, t2: null });
    }

    const placeholders = codes.map(() => '?').join(',');

    // 查询1：获取每个股票 >= t1 的最早数据（limit 1）
    const sqlT1 = `
      WITH ranked_t1 AS (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY code ORDER BY date ASC) as rn
        FROM stock_day_pepb_data
        WHERE date >= ?
          AND code IN (${placeholders})
      )
      SELECT * FROM ranked_t1 WHERE rn = 1
    `;
    
    // 查询2：获取每个股票 <= t2 的最新数据（limit 1）
    const sqlT2 = `
      WITH ranked_t2 AS (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY code ORDER BY date DESC) as rn
        FROM stock_day_pepb_data
        WHERE date <= ?
          AND code IN (${placeholders})
      )
      SELECT * FROM ranked_t2 WHERE rn = 1
    `;
    
    // 并行执行两个查询
    const paramsT1 = [t1, ...codes];
    const paramsT2 = [t2, ...codes];
    
    const [t1DataList, t2DataList] = await Promise.all([
      this.databaseService.query<StockDayPepbData>(sqlT1, paramsT1),
      this.databaseService.query<StockDayPepbData>(sqlT2, paramsT2),
    ]);

    // 将查询结果转换为Map以便快速查找
    const t1DataMap = new Map<string, StockDayPepbData>();
    const t2DataMap = new Map<string, StockDayPepbData>();
    
    for (const data of t1DataList) {
      t1DataMap.set(data.code, data);
    }
    
    for (const data of t2DataList) {
      t2DataMap.set(data.code, data);
    }

    // 组装结果
    for (const code of codes) {
      result.set(code, {
        t1: t1DataMap.get(code) || null,
        t2: t2DataMap.get(code) || null,
      });
    }

    return result;
  }

  /**
   * 批量插入股票数据
   */
  async batchInsertStockData(data: StockDayPepbData[]): Promise<void> {
    if (data.length === 0) return;

    const columns = Object.keys(data[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT OR REPLACE INTO stock_day_pepb_data (${columns.join(', ')}) VALUES (${placeholders})`;
    
    const insert = this.databaseService.getDatabase().prepare(sql);
    const transaction = this.databaseService.getDatabase().transaction((items: StockDayPepbData[]) => {
      for (const item of items) {
        const values = columns.map(col => item[col as keyof StockDayPepbData]);
        insert.run(...values);
      }
    });

    transaction(data);
  }

  /**
   * 批量插入分红数据
   */
  async batchInsertBonusData(data: StockBonusData[]): Promise<void> {
    if (data.length === 0) return;

    const columns = Object.keys(data[0]);
    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT OR REPLACE INTO stock_bonus_data (${columns.join(', ')}) VALUES (${placeholders})`;
    
    const insert = this.databaseService.getDatabase().prepare(sql);
    const transaction = this.databaseService.getDatabase().transaction((items: StockBonusData[]) => {
      for (const item of items) {
        const values = columns.map(col => item[col as keyof StockBonusData]);
        insert.run(...values);
      }
    });

    transaction(data);
  }

  /**
   * 获取指数估值数据
   * @param code 指数代码（可选，不传则获取所有指数数据）
   * @param limit 限制返回的数据条数（可选，0表示无限制）
   */
  async getIndexValuationData(code?: string, limit: number = 0): Promise<IndexValuationData[]> {
    let sql = `
      SELECT * FROM index_valuation_data
    `;
    const params: any[] = [];

    if (code) {
      sql += ` WHERE code = ? `;
      params.push(code);
    }

    sql += ` ORDER BY date DESC `;

    if (limit > 0) {
      sql += ` LIMIT ? `;
      params.push(limit);
    }

    return this.databaseService.query<IndexValuationData>(sql, params);
  }

  /**
   * 获取所有指数代码
   */
  async getIndexCodes(): Promise<{ code: string; codeName: string }[]> {
    const sql = `
      SELECT DISTINCT code, codeName
      FROM index_valuation_data
      WHERE codeName IS NOT NULL
      ORDER BY code
    `;
    const results = await this.databaseService.query<any>(sql);
    
    return results.map(row => ({
      code: row.code,
      codeName: row.codeName,
    }));
  }

  /**
   * 获取指数估值数据的时间范围
   */
  async getIndexValuationDateRange(code?: string): Promise<{ minDate: string; maxDate: string }> {
    let sql = `
      SELECT MIN(date) as minDate, MAX(date) as maxDate
      FROM index_valuation_data
    `;
    const params: any[] = [];

    if (code) {
      sql += ` WHERE code = ? `;
      params.push(code);
    }

    const result = await this.databaseService.queryOne<{ minDate: string; maxDate: string }>(sql, params);
    
    return {
      minDate: result?.minDate || '',
      maxDate: result?.maxDate || '',
    };
  }

  /**
   * 获取数据库统计信息
   */
  async getDatabaseStats(): Promise<{
    stockCount: number;
    bonusCount: number;
    lastUpdateDate: string;
    tableSize: number;
  }> {
    const stockCount = await this.databaseService.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM stock_day_pepb_data'
    )?.count || 0;

    const bonusCount = await this.databaseService.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM stock_bonus_data'
    )?.count || 0;

    const lastUpdateDate = await this.databaseService.queryOne<{ maxDate: string }>(
      'SELECT MAX(date) as maxDate FROM stock_day_pepb_data'
    )?.maxDate || '';

    const tableSize = await this.databaseService.queryOne<{ page_count: number }>(
      'SELECT page_count FROM pragma_page_count()'
    )?.page_count || 0;

    return {
      stockCount,
      bonusCount,
      lastUpdateDate,
      tableSize,
    };
  }

  /**
   * 根据日期范围查询沪深300指数数据
   */
  async findHushen300ByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<Hushen300[]> {
    const sql = `
      SELECT * FROM hushen300
      WHERE date >= ?
        AND date <= ?
      ORDER BY date ASC
    `;
    return this.databaseService.query<Hushen300>(sql, [startDate, endDate]);
  }

  /**
   * 获取沪深300指数最新数据
   */
  async getLatestHushen300Data(): Promise<Hushen300 | null> {
    const sql = `
      SELECT * FROM hushen300
      ORDER BY date DESC
      LIMIT 1
    `;
    return this.databaseService.queryOne<Hushen300>(sql);
  }

  /**
   * 获取沪深300指数历史数据（按日期降序）
   */
  async getHushen300History(limit: number = 365): Promise<Hushen300[]> {
    const sql = `
      SELECT * FROM hushen300
      ORDER BY date DESC
      LIMIT ?
    `;
    const recentData = await this.databaseService.query<Hushen300>(sql, [limit]);

    // 按升序排序返回
    return recentData.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * 获取股票的股息支付率历史数据
   */
  async getDividendRatioHistory(code: string): Promise<DividendRatioData[]> {
    // 转换为eastmoney格式的代码
    const eastmoneyCode = this.convertToEastmoneyCode(code);
    
    const sql = `
      SELECT
        SECUCODE as secucode,
        SECURITY_NAME_ABBR as securityNameAbbr,
        REPORT_DATE as reportDate,
        CAST(PARENTNETPROFIT AS REAL) as parentNetProfit,
        CAST(DIVIDEND_IMPLE AS REAL) as dividendImple,
        CAST(DIVIDEND_PLAN AS REAL) as dividendPlan,
        CAST(DIVIDEND_PAY_IMPLE AS REAL) as dividendPayImple,
        CAST(DIVIDEND_PAY_PLAN AS REAL) as dividendPayPlan
      FROM eastmoney_dividend_ratio
      WHERE SECUCODE = ?
      ORDER BY REPORT_DATE DESC
    `;
    
    const rawData = await this.databaseService.query<any>(sql, [eastmoneyCode]);
    
    // 转换为前端需要的格式
    return rawData.map(item => ({
      code: this.convertFromEastmoneyCode(item.secucode),
      date: item.reportDate,
      codeName: item.securityNameAbbr || '',
      dividendPayRatio: item.dividendPayImple,
      dividendImple: item.dividendImple,
      parentNetProfit: item.parentNetProfit
    }));
  }

  /**
   * 获取最新的股息支付率数据
   */
  async getLatestDividendRatio(code: string): Promise<DividendRatioData | null> {
    // 转换为eastmoney格式的代码
    const eastmoneyCode = this.convertToEastmoneyCode(code);
    
    const sql = `
      SELECT
        SECUCODE as secucode,
        SECURITY_NAME_ABBR as securityNameAbbr,
        REPORT_DATE as reportDate,
        CAST(DIVIDEND_PAY_IMPLE AS REAL) as dividendPayImple,
        CAST(DIVIDEND_IMPLE AS REAL) as dividendImple,
        CAST(PARENTNETPROFIT AS REAL) as parentNetProfit
      FROM eastmoney_dividend_ratio
      WHERE SECUCODE = ?
      ORDER BY REPORT_DATE DESC
      LIMIT 1
    `;
    
    const rawData = await this.databaseService.query<any>(sql, [eastmoneyCode]);
    
    if (rawData.length === 0) {
      return null;
    }
    
    const item = rawData[0];
    return {
      code: this.convertFromEastmoneyCode(item.secucode),
      date: item.reportDate,
      codeName: item.securityNameAbbr || '',
      dividendPayRatio: item.dividendPayImple,
      dividendImple: item.dividendImple,
      parentNetProfit: item.parentNetProfit
    };
  }
}