import { Controller, Get } from '@nestjs/common';
import { PortfolioBacktestService, PortfolioBacktestStatInfo } from '../services/portfolio-backtest.service';

@Controller('api/portfolio-backtest')
export class PortfolioBacktestController {
  constructor(private readonly portfolioBacktestService: PortfolioBacktestService) {}

  /**
   * 获取组合回测统计信息
   * 返回每个日期的 median_pe（PE中位数）、median_pb（PB中位数）、
   * median_pe_pb（PE*PB中位数）、median_dividend_yield（分红率）、
   * median_roe（ROE中位数）
   */
  @Get('stat-info')
  getStatInfo(): PortfolioBacktestStatInfo[] {
    return this.portfolioBacktestService.getStatInfo();
  }
}
