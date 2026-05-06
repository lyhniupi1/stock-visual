import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';

export interface PortfolioBacktestStatInfo {
  date: string;
  stock_codes: string;
  median_pe: number;
  median_pb: number;
  median_pe_pb: number;
  median_dividend_yield: number;
  median_roe: number;
  adjust_action: string;
}

@Injectable()
export class PortfolioBacktestService {
  constructor(private databaseService: DatabaseService) {}

  /**
   * 获取组合回测统计信息
   * 从 magicFormulaData.db 的 portfolio_backtest_stat_info 表读取数据
   */
  getStatInfo(): PortfolioBacktestStatInfo[] {
    const sql = `
      SELECT date, stock_codes, median_pe, median_pb, median_pe_pb, 
             median_dividend_yield, median_roe, adjust_action
      FROM portfolio_backtest_stat_info
      ORDER BY date ASC
    `;
    return this.databaseService.query<PortfolioBacktestStatInfo>(sql);
  }
}
