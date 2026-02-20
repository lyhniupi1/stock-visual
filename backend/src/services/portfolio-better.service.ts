import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { StockBetterService } from './stock-better.service';

// 定义组合股票接口
export interface PortfolioStock {
  code: string;
  quantity: number;
  costPrice: number;
}

// 定义组合接口
export interface Portfolio {
  id: number;
  name: string;
  createdAt: string;
  createdTime: string;
  initialValue: number;
  currentValue: number;
  stocks: PortfolioStock[];
}

@Injectable()
export class PortfolioBetterService {
  constructor(
    private databaseService: DatabaseService,
    private stockBetterService: StockBetterService,
  ) {}

  /**
   * 获取所有组合
   */
  async findAll(): Promise<Portfolio[]> {
    const sql = `
      SELECT * FROM portfolio 
      ORDER BY createdTime DESC
    `;
    const portfolios = await this.databaseService.query<Portfolio>(sql);
    
    // 更新每个组合的当前市值和盈亏
    for (const portfolio of portfolios) {
      await this.updatePortfolioValue(portfolio);
    }
    
    return portfolios;
  }

  /**
   * 根据ID获取组合
   */
  async findById(id: number): Promise<Portfolio> {
    const sql = 'SELECT * FROM portfolio WHERE id = ?';
    const portfolio = await this.databaseService.queryOne<Portfolio>(sql, [id]);
    
    if (!portfolio) {
      throw new NotFoundException(`组合ID ${id} 不存在`);
    }
    
    await this.updatePortfolioValue(portfolio);
    return portfolio;
  }

  /**
   * 创建新组合
   */
  async create(
    name: string,
    stocks: PortfolioStock[],
    createdAt: string,
  ): Promise<Portfolio> {
    const createdTime = new Date().toISOString();
    const stocksJson = JSON.stringify(stocks);
    
    // 计算初始市值
    let initialValue = 0;
    for (const stock of stocks) {
      initialValue += stock.quantity * stock.costPrice;
    }

    const sql = `
      INSERT INTO portfolio (name, createdAt, createdTime, initialValue, currentValue, stocks)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = this.databaseService.execute(sql, [
      name,
      createdAt,
      createdTime,
      initialValue,
      initialValue, // 初始当前市值等于初始市值
      stocksJson,
    ]);

    const portfolioId = result.lastInsertRowid;
    return this.findById(portfolioId as number);
  }

  /**
   * 更新组合
   */
  async update(
    id: number,
    name?: string,
    stocks?: PortfolioStock[],
  ): Promise<Portfolio> {
    const portfolio = await this.findById(id);
    
    const updates: string[] = [];
    const params: any[] = [];
    
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name);
    }
    
    if (stocks !== undefined) {
      const stocksJson = JSON.stringify(stocks);
      updates.push('stocks = ?');
      params.push(stocksJson);
      
      // 重新计算初始市值
      let initialValue = 0;
      for (const stock of stocks) {
        initialValue += stock.quantity * stock.costPrice;
      }
      updates.push('initialValue = ?');
      params.push(initialValue);
    }
    
    if (updates.length > 0) {
      updates.push('currentValue = ?');
      params.push(portfolio.currentValue);
      
      params.push(id);
      const sql = `UPDATE portfolio SET ${updates.join(', ')} WHERE id = ?`;
      this.databaseService.execute(sql, params);
    }
    
    return this.findById(id);
  }

  /**
   * 删除组合
   */
  async delete(id: number): Promise<void> {
    const sql = 'DELETE FROM portfolio WHERE id = ?';
    const result = this.databaseService.execute(sql, [id]);
    
    if (result.changes === 0) {
      throw new NotFoundException(`组合ID ${id} 不存在`);
    }
  }

  /**
   * 更新组合当前市值
   */
  private async updatePortfolioValue(portfolio: Portfolio): Promise<void> {
    const stocks = portfolio.stocks || [];
    if (stocks.length === 0) {
      portfolio.currentValue = portfolio.initialValue;
      return;
    }

    let currentValue = 0;
    
    for (const stock of stocks) {
      // 获取该股票最新价格
      const latestData = await this.stockBetterService.getLatestStockData(stock.code);
      
      if (latestData) {
        currentValue += stock.quantity * latestData.close;
      } else {
        // 如果找不到最新价格，使用成本价
        currentValue += stock.quantity * stock.costPrice;
      }
    }
    
    portfolio.currentValue = currentValue;
    
    // 更新数据库中的当前市值
    const sql = 'UPDATE portfolio SET currentValue = ? WHERE id = ?';
    this.databaseService.execute(sql, [currentValue, portfolio.id]);
  }

  /**
   * 批量更新所有组合的当前市值（高性能版本）
   */
  async batchUpdateAllPortfolioValues(): Promise<void> {
    // 获取所有组合
    const portfolios = await this.databaseService.query<Portfolio>('SELECT * FROM portfolio');
    
    if (portfolios.length === 0) {
      return;
    }

    // 收集所有股票代码
    const allStocks: { code: string }[] = [];
    const portfolioStocksMap = new Map<number, PortfolioStock[]>();
    
    for (const portfolio of portfolios) {
      const stocks = portfolio.stocks || [];
      portfolioStocksMap.set(portfolio.id, stocks);
      allStocks.push(...stocks.map(stock => ({ code: stock.code })));
    }
    
    // 获取所有唯一的股票代码
    const uniqueCodes = [...new Set(allStocks.map(s => s.code))];
    
    // 批量获取所有股票的最新价格
    const latestPrices = new Map<string, number>();
    for (const code of uniqueCodes) {
      const stockData = await this.stockBetterService.getLatestStockData(code);
      if (stockData) {
        latestPrices.set(code, stockData.close);
      }
    }
    
    // 更新每个组合的市值
    for (const portfolio of portfolios) {
      const stocks = portfolioStocksMap.get(portfolio.id) || [];
      let currentValue = 0;
      
      for (const stock of stocks) {
        const latestPrice = latestPrices.get(stock.code);
        if (latestPrice !== undefined) {
          currentValue += stock.quantity * latestPrice;
        } else {
          currentValue += stock.quantity * stock.costPrice;
        }
      }
      
      // 更新数据库
      const sql = 'UPDATE portfolio SET currentValue = ? WHERE id = ?';
      this.databaseService.execute(sql, [currentValue, portfolio.id]);
    }
  }

  /**
   * 获取组合统计信息
   */
  async getPortfolioStats(): Promise<{
    totalPortfolios: number;
    totalValue: number;
    avgReturn: number;
    bestPerformer: { id: number; name: string; return: number } | null;
  }> {
    const portfolios = await this.findAll();
    
    if (portfolios.length === 0) {
      return {
        totalPortfolios: 0,
        totalValue: 0,
        avgReturn: 0,
        bestPerformer: null,
      };
    }

    let totalValue = 0;
    let totalReturn = 0;
    let bestPortfolio: { id: number; name: string; return: number } | null = null;

    for (const portfolio of portfolios) {
      const portfolioReturn = portfolio.initialValue > 0 
        ? ((portfolio.currentValue - portfolio.initialValue) / portfolio.initialValue) * 100
        : 0;
      
      totalValue += portfolio.currentValue;
      totalReturn += portfolioReturn;

      if (!bestPortfolio || portfolioReturn > bestPortfolio.return) {
        bestPortfolio = {
          id: portfolio.id,
          name: portfolio.name,
          return: portfolioReturn,
        };
      }
    }

    const avgReturn = totalReturn / portfolios.length;

    return {
      totalPortfolios: portfolios.length,
      totalValue,
      avgReturn,
      bestPerformer: bestPortfolio,
    };
  }

  /**
   * 搜索包含特定股票的组合
   */
  async findPortfoliosByStockCode(code: string): Promise<Portfolio[]> {
    const sql = 'SELECT * FROM portfolio';
    const allPortfolios = await this.databaseService.query<Portfolio>(sql);
    
    const matchingPortfolios: Portfolio[] = [];
    
    for (const portfolio of allPortfolios) {
      const stocks = portfolio.stocks || [];
      const hasStock = stocks.some(stock => stock.code === code);
      
      if (hasStock) {
        await this.updatePortfolioValue(portfolio);
        matchingPortfolios.push(portfolio);
      }
    }
    
    return matchingPortfolios;
  }

  /**
   * 导入组合数据
   */
  async importPortfolios(portfolios: Omit<Portfolio, 'id'>[]): Promise<void> {
    if (portfolios.length === 0) return;

    const sql = `
      INSERT INTO portfolio (name, createdAt, createdTime, initialValue, currentValue, stocks)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const insert = this.databaseService.getDatabase().prepare(sql);
    const transaction = this.databaseService.getDatabase().transaction((items: Omit<Portfolio, 'id'>[]) => {
      for (const item of items) {
        const stocksJson = JSON.stringify(item.stocks || []);
        const createdTime = item.createdTime || new Date().toISOString();
        
        insert.run(
          item.name,
          item.createdAt,
          createdTime,
          item.initialValue,
          item.currentValue || item.initialValue,
          stocksJson
        );
      }
    });

    transaction(portfolios);
  }
}