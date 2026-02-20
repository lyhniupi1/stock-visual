import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';

// 定义股票数据接口
export interface StockData {
  id: number;
  code: string;
  codeName: string;
  date: string;
  peTTM: number;
  pbMRQ: number;
  close: number;
  volume: number;
  amount: number;
  totalShares: number;
  totalMarketCap: number;
  circulatingShares: number;
  circulatingMarketCap: number;
}

// 定义股票分红数据接口
export interface StockBonusData {
  id: number;
  code: string;
  dateStr: string;
  bonus: string;
  dividend: string;
  allotment: string;
}

@Injectable()
export class SqliteQueryService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * 使用better-sqlite3查询股票数据（高性能）
   */
  findStocksByCode(code: string, limit: number = 100): StockData[] {
    const sql = `
      SELECT * FROM stock_day_pepb_data 
      WHERE code = ? 
      ORDER BY date DESC 
      LIMIT ?
    `;
    return this.databaseService.query<StockData>(sql, [code, limit]);
  }

  /**
   * 获取股票最新数据
   */
  getLatestStockData(code: string): StockData | null {
    const sql = `
      SELECT * FROM stock_day_pepb_data 
      WHERE code = ? 
      ORDER BY date DESC 
      LIMIT 1
    `;
    return this.databaseService.queryOne<StockData>(sql, [code]);
  }

  /**
   * 批量查询多个股票的最新数据
   */
  getLatestStockDataBatch(codes: string[]): Map<string, StockData> {
    if (codes.length === 0) {
      return new Map();
    }

    const placeholders = codes.map(() => '?').join(',');
    const sql = `
      WITH ranked AS (
        SELECT *,
               ROW_NUMBER() OVER (PARTITION BY code ORDER BY date DESC) as rn
        FROM stock_day_pepb_data
        WHERE code IN (${placeholders})
      )
      SELECT * FROM ranked WHERE rn = 1
    `;

    const results = this.databaseService.query<StockData>(sql, codes);
    const resultMap = new Map<string, StockData>();
    
    for (const stock of results) {
      resultMap.set(stock.code, stock);
    }

    return resultMap;
  }

  /**
   * 查询指定日期范围内的股票数据
   */
  findStocksByDateRange(code: string, startDate: string, endDate: string): StockData[] {
    const sql = `
      SELECT * FROM stock_day_pepb_data 
      WHERE code = ? 
        AND date >= ? 
        AND date <= ? 
      ORDER BY date ASC
    `;
    return this.databaseService.query<StockData>(sql, [code, startDate, endDate]);
  }

  /**
   * 获取所有股票代码
   */
  getAllStockCodes(): { code: string; codeName: string }[] {
    const sql = `
      SELECT DISTINCT code, codeName 
      FROM stock_day_pepb_data 
      WHERE codeName IS NOT NULL 
      ORDER BY code
    `;
    return this.databaseService.query<{ code: string; codeName: string }>(sql);
  }

  /**
   * 获取股票分红数据
   */
  getStockBonusData(code: string): StockBonusData[] {
    const sql = `
      SELECT * FROM stock_bonus_data 
      WHERE code = ? 
      ORDER BY dateStr DESC
    `;
    return this.databaseService.query<StockBonusData>(sql, [code]);
  }

  /**
   * 执行复杂聚合查询：获取某日期所有股票的PE/PB统计
   */
  getStockStatsByDate(date: string): {
    date: string;
    totalStocks: number;
    avgPE: number;
    avgPB: number;
    minPE: number;
    maxPE: number;
    minPB: number;
    maxPB: number;
  } {
    const sql = `
      SELECT 
        date,
        COUNT(*) as totalStocks,
        AVG(peTTM) as avgPE,
        AVG(pbMRQ) as avgPB,
        MIN(peTTM) as minPE,
        MAX(peTTM) as maxPE,
        MIN(pbMRQ) as minPB,
        MAX(pbMRQ) as maxPB
      FROM stock_day_pepb_data 
      WHERE date = ? 
        AND peTTM >= 0 
        AND pbMRQ >= 0
    `;

    const result = this.databaseService.queryOne<any>(sql, [date]);
    
    return {
      date,
      totalStocks: result?.totalStocks || 0,
      avgPE: result?.avgPE ? parseFloat(result.avgPE.toFixed(2)) : 0,
      avgPB: result?.avgPB ? parseFloat(result.avgPB.toFixed(2)) : 0,
      minPE: result?.minPE || 0,
      maxPE: result?.maxPE || 0,
      minPB: result?.minPB || 0,
      maxPB: result?.maxPB || 0,
    };
  }

  /**
   * 批量插入股票数据（高性能）
   */
  batchInsertStockData(data: StockData[]): void {
    this.databaseService.batchInsert('stock_day_pepb_data', data);
  }

  /**
   * 批量插入分红数据
   */
  batchInsertBonusData(data: StockBonusData[]): void {
    this.databaseService.batchInsert('stock_bonus_data', data);
  }

  /**
   * 创建索引以提高查询性能
   */
  createIndexes(): void {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_stock_code ON stock_day_pepb_data(code)',
      'CREATE INDEX IF NOT EXISTS idx_stock_date ON stock_day_pepb_data(date)',
      'CREATE INDEX IF NOT EXISTS idx_stock_code_date ON stock_day_pepb_data(code, date)',
      'CREATE INDEX IF NOT EXISTS idx_bonus_code ON stock_bonus_data(code)',
      'CREATE INDEX IF NOT EXISTS idx_bonus_date ON stock_bonus_data(dateStr)',
    ];

    for (const sql of indexes) {
      this.databaseService.execute(sql);
    }
  }

  /**
   * 执行原生SQL查询（灵活查询）
   */
  executeRawQuery<T = any>(sql: string, params: any[] = []): T[] {
    return this.databaseService.query<T>(sql, params);
  }

  /**
   * 获取数据库统计信息
   */
  getDatabaseStats(): {
    stockCount: number;
    bonusCount: number;
    lastUpdateDate: string;
    tableSize: number;
  } {
    const stockCount = this.databaseService.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM stock_day_pepb_data'
    )?.count || 0;

    const bonusCount = this.databaseService.queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM stock_bonus_data'
    )?.count || 0;

    const lastUpdateDate = this.databaseService.queryOne<{ maxDate: string }>(
      'SELECT MAX(date) as maxDate FROM stock_day_pepb_data'
    )?.maxDate || '';

    const tableSize = this.databaseService.queryOne<{ page_count: number }>(
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