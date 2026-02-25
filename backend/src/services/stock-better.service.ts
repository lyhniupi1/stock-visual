import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { StockDayPepbData } from '../entities/stock-day-pepb-data.entity';
import { StockBonusData } from '../entities/stock-bonus-data.entity';
import { IndexValuationData } from '../entities/index-valuation-data.entity';

// 定义数据库查询返回的股票数据接口（与实体兼容）
export interface StockDayPepbDataRecord extends StockDayPepbData {
  id?: number;
}

// 定义数据库查询返回的分红数据接口（与实体兼容）
export interface StockBonusDataRecord extends StockBonusData {
  id?: number;
}

@Injectable()
export class StockBetterService {
  constructor(private databaseService: DatabaseService) {}

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
    data: StockDayPepbData[];
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

    // 计算综合排名（PE排名 + PB排名）
    const stocksWithRank = allStocks.map(stock => {
      // PE为负数的排名设为9999
      const peRank = (stock.peTTM || 0) < 0 ? 9999 : (peRankMap.get(stock.code) || (positivePEStocks.length + 1));
      // PB为负数的排名设为9999
      const pbRank = (stock.pbMRQ || 0) < 0 ? 9999 : (pbRankMap.get(stock.code) || (positivePBStocks.length + 1));
      
      return {
        ...stock,
        peRank,
        pbRank,
        totalRank: peRank + pbRank,
      };
    });

    // 按综合排名升序排序
    stocksWithRank.sort((a, b) => a.totalRank - b.totalRank);

    // 分页
    const total = stocksWithRank.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = stocksWithRank.slice(startIndex, endIndex);

    // 移除排名字段，返回原始数据结构
    const data = paginatedData.map(({ peRank, pbRank, totalRank, ...stock }) => stock);

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
}