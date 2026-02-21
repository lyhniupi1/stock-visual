import { Injectable, NotFoundException } from '@nestjs/common';
import { Portfolio, PortfolioStock } from '../entities/portfolio.entity';
import { StockDayPepbData } from '../entities/stock-day-pepb-data.entity';
import { DatabaseService } from '../database.service';

@Injectable()
export class PortfolioService {
  constructor(
    private databaseService: DatabaseService,
  ) {}

  // 将数据库行转换为Portfolio实例
  private createPortfolioFromRow(row: any): Portfolio {
    const portfolio = new Portfolio();
    portfolio.id = row.id;
    portfolio.name = row.name;
    portfolio.stockCount = row.stock_count;
    portfolio.stocks = row.stocks;
    portfolio.createdAt = row.created_at;
    portfolio.initialValue = row.initial_value;
    portfolio.currentValue = row.current_value;
    portfolio.createdTime = row.created_time ? new Date(row.created_time) : new Date();
    portfolio.updatedTime = row.updated_time ? new Date(row.updated_time) : new Date();
    return portfolio;
  }

  // 获取所有组合
  async findAll(): Promise<Portfolio[]> {
    const sql = `SELECT * FROM portfolios ORDER BY created_time DESC`;
    const rows = await this.databaseService.query<any>(sql);
    const portfolios = rows.map(row => this.createPortfolioFromRow(row));
    
    return portfolios;
  }

  // 根据ID获取组合
  async findById(id: number): Promise<Portfolio> {
    const sql = `SELECT * FROM portfolios WHERE id = ?`;
    const row = await this.databaseService.queryOne<any>(sql, [id]);
    
    if (!row) {
      throw new NotFoundException(`组合ID ${id} 不存在`);
    }
    
    const portfolio = this.createPortfolioFromRow(row);
    return portfolio;
  }

  // 创建新组合
  async create(
    name: string,
    stocks: PortfolioStock[],
    createdAt: string,
  ): Promise<Portfolio> {
    const portfolio = new Portfolio();
    portfolio.name = name;
    portfolio.createdAt = createdAt;
    portfolio.setStockList(stocks);
    
    // 计算初始市值
    let initialValue = 0;
    for (const stock of stocks) {
      initialValue += stock.quantity * stock.costPrice;
    }
    portfolio.initialValue = initialValue;
    
    // 插入数据库
    const sql = `
      INSERT INTO portfolios (name, stock_count, stocks, created_at, initial_value, current_value, created_time, updated_time)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    const result = await this.databaseService.execute(sql, [
      portfolio.name,
      portfolio.stockCount,
      portfolio.stocks,
      portfolio.createdAt,
      portfolio.initialValue,
      portfolio.currentValue || null,
    ]);
    
    // 获取插入的ID并返回完整的portfolio对象
    portfolio.id = result.lastInsertRowid;
    return portfolio;
  }

  // 更新组合
  async update(
    id: number,
    name?: string,
    stocks?: PortfolioStock[],
  ): Promise<Portfolio> {
    const portfolio = await this.findById(id);
    
    if (name !== undefined) {
      portfolio.name = name;
    }
    
    if (stocks !== undefined) {
      portfolio.setStockList(stocks);
      // 重新计算初始市值
      let initialValue = 0;
      for (const stock of stocks) {
        initialValue += stock.quantity * stock.costPrice;
      }
      portfolio.initialValue = initialValue;
    }
    
    // 更新数据库
    const sql = `
      UPDATE portfolios
      SET name = ?, stock_count = ?, stocks = ?, initial_value = ?, updated_time = datetime('now')
      WHERE id = ?
    `;
    await this.databaseService.execute(sql, [
      portfolio.name,
      portfolio.stockCount,
      portfolio.stocks,
      portfolio.initialValue,
      id,
    ]);
    
    return portfolio;
  }

  // 删除组合
  async delete(id: number): Promise<void> {
    const sql = `DELETE FROM portfolios WHERE id = ?`;
    const result = await this.databaseService.execute(sql, [id]);
    
    if (result.changes === 0) {
      throw new NotFoundException(`组合ID ${id} 不存在`);
    }
  }



  /**
   * 获取股票最新价格
   */
  private async getStockLatestPrice(code: string): Promise<StockDayPepbData | null> {
    const sql = `
      SELECT * FROM stock_day_pepb_data
      WHERE code = ?
      ORDER BY date DESC
      LIMIT 1
    `;
    return this.databaseService.queryOne<StockDayPepbData>(sql, [code]);
  }

  /**
   * 批量获取股票最新价格
   */
  private async getStockLatestPriceBatch(codes: string[]): Promise<Map<string, StockDayPepbData>> {
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
    
    const stocks = await this.databaseService.query<StockDayPepbData>(sql, codes);
    const result = new Map<string, StockDayPepbData>();
    
    for (const stock of stocks) {
      result.set(stock.code, stock);
    }
    
    return result;
  }

}
