import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio, PortfolioStock } from '../entities/portfolio.entity';
import { StockDayPepbData } from '../entities/stock-day-pepb-data.entity';
import { DatabaseService } from '../database.service';
import { SqliteQueryService } from './sqlite-query.service';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    @InjectRepository(StockDayPepbData)
    private stockRepository: Repository<StockDayPepbData>,
    private databaseService: DatabaseService,
    private sqliteQueryService: SqliteQueryService,
  ) {}

  // 获取所有组合
  async findAll(): Promise<Portfolio[]> {
    const portfolios = await this.portfolioRepository.find({
      order: { createdTime: 'DESC' },
    });
    
    // 更新每个组合的当前市值和盈亏
    for (const portfolio of portfolios) {
      await this.updatePortfolioValue(portfolio);
    }
    
    return portfolios;
  }

  // 根据ID获取组合
  async findById(id: number): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
    });
    
    if (!portfolio) {
      throw new NotFoundException(`组合ID ${id} 不存在`);
    }
    
    await this.updatePortfolioValue(portfolio);
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
    
    return this.portfolioRepository.save(portfolio);
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
    
    return this.portfolioRepository.save(portfolio);
  }

  // 删除组合
  async delete(id: number): Promise<void> {
    const result = await this.portfolioRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`组合ID ${id} 不存在`);
    }
  }

  // 更新组合当前市值
  private async updatePortfolioValue(portfolio: Portfolio): Promise<void> {
    const stocks = portfolio.getStockList();
    if (stocks.length === 0) {
      portfolio.currentValue = portfolio.initialValue;
      return;
    }

    let currentValue = 0;
    
    for (const stock of stocks) {
      // 获取该股票最新价格
      const latestData = await this.stockRepository.findOne({
        where: { code: stock.code },
        order: { date: 'DESC' },
      });
      
      if (latestData) {
        currentValue += stock.quantity * latestData.close;
      } else {
        // 如果找不到最新价格，使用成本价
        currentValue += stock.quantity * stock.costPrice;
      }
    }
    
    portfolio.currentValue = currentValue;
  }

  /**
   * 使用better-sqlite3获取股票最新价格（高性能版本）
   */
  private async getStockLatestPriceFast(code: string): Promise<number | null> {
    const stockData = this.sqliteQueryService.getLatestStockData(code);
    return stockData?.close || null;
  }

  /**
   * 使用better-sqlite3更新组合当前市值（高性能版本）
   */
  async updatePortfolioValueFast(portfolio: Portfolio): Promise<void> {
    const stocks = portfolio.getStockList();
    if (stocks.length === 0) {
      portfolio.currentValue = portfolio.initialValue;
      return;
    }

    let currentValue = 0;
    const codes = stocks.map(stock => stock.code);
    
    // 批量获取所有股票的最新价格
    const latestPrices = this.sqliteQueryService.getLatestStockDataBatch(codes);
    
    for (const stock of stocks) {
      const stockData = latestPrices.get(stock.code);
      if (stockData) {
        currentValue += stock.quantity * stockData.close;
      } else {
        // 如果找不到最新价格，使用成本价
        currentValue += stock.quantity * stock.costPrice;
      }
    }
    
    portfolio.currentValue = currentValue;
  }

  /**
   * 使用better-sqlite3获取所有组合（高性能版本）
   */
  async findAllFast(): Promise<Portfolio[]> {
    const portfolios = await this.portfolioRepository.find({
      order: { createdTime: 'DESC' },
    });
    
    // 使用better-sqlite3批量更新每个组合的当前市值
    const allStocks: { code: string }[] = [];
    const portfolioStocksMap = new Map<number, string[]>();
    
    for (const portfolio of portfolios) {
      const stocks = portfolio.getStockList();
      const codes = stocks.map(stock => stock.code);
      portfolioStocksMap.set(portfolio.id, codes);
      allStocks.push(...stocks.map(stock => ({ code: stock.code })));
    }
    
    // 获取所有股票代码
    const uniqueCodes = [...new Set(allStocks.map(s => s.code))];
    const latestPrices = this.sqliteQueryService.getLatestStockDataBatch(uniqueCodes);
    
    // 更新每个组合的市值
    for (const portfolio of portfolios) {
      const codes = portfolioStocksMap.get(portfolio.id) || [];
      let currentValue = 0;
      const stocks = portfolio.getStockList();
      
      for (let i = 0; i < stocks.length; i++) {
        const stock = stocks[i];
        const stockData = latestPrices.get(stock.code);
        if (stockData) {
          currentValue += stock.quantity * stockData.close;
        } else {
          currentValue += stock.quantity * stock.costPrice;
        }
      }
      
      portfolio.currentValue = currentValue;
    }
    
    return portfolios;
  }

  /**
   * 使用better-sqlite3执行批量操作
   */
  async batchUpdatePortfolioValues(portfolioIds: number[]): Promise<void> {
    const portfolios = await this.portfolioRepository.findByIds(portfolioIds);
    
    // 收集所有股票代码
    const allStocks: { code: string }[] = [];
    for (const portfolio of portfolios) {
      const stocks = portfolio.getStockList();
      allStocks.push(...stocks.map(stock => ({ code: stock.code })));
    }
    
    const uniqueCodes = [...new Set(allStocks.map(s => s.code))];
    const latestPrices = this.sqliteQueryService.getLatestStockDataBatch(uniqueCodes);
    
    // 更新每个组合
    for (const portfolio of portfolios) {
      const stocks = portfolio.getStockList();
      let currentValue = 0;
      
      for (const stock of stocks) {
        const stockData = latestPrices.get(stock.code);
        if (stockData) {
          currentValue += stock.quantity * stockData.close;
        } else {
          currentValue += stock.quantity * stock.costPrice;
        }
      }
      
      portfolio.currentValue = currentValue;
      await this.portfolioRepository.save(portfolio);
    }
  }
}
