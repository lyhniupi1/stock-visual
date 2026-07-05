import { Controller, Get, Query } from '@nestjs/common';
import { StockBetterService } from '../services/stock-better.service';
import { Hushen300 } from '../entities/hushen300.entity';
import { Zz500 } from '../entities/zz500.entity';

@Controller('api/valuation')
export class ValuationController {
  constructor(private readonly stockService: StockBetterService) {}

  /**
   * 获取沪深300指数数据（根据日期范围）
   * @param startDate 开始日期 (YYYY-MM-DD)
   * @param endDate 结束日期 (YYYY-MM-DD)
   */
  @Get('hushen300')
  async getHushen300ByDateRange(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ): Promise<Hushen300[]> {
    return this.stockService.findHushen300ByDateRange(startDate, endDate);
  }

  /**
   * 获取沪深300指数最新数据
   */
  @Get('hushen300/latest')
  async getLatestHushen300Data(): Promise<Hushen300 | null> {
    return this.stockService.getLatestHushen300Data();
  }

  /**
   * 获取沪深300指数历史数据
   * @param limit 限制返回的数据条数（默认365条）
   */
  @Get('hushen300/history')
  async getHushen300History(
    @Query('limit') limit: string = '365',
  ): Promise<Hushen300[]> {
    return this.stockService.getHushen300History(parseInt(limit, 10));
  }

  /**
   * 获取中证500指数数据（根据日期范围）
   * @param startDate 开始日期 (YYYY-MM-DD)
   * @param endDate 结束日期 (YYYY-MM-DD)
   */
  @Get('zz500')
  async getZz500ByDateRange(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ): Promise<Zz500[]> {
    return this.stockService.findZz500ByDateRange(startDate, endDate);
  }

  /**
   * 获取中证500指数最新数据
   */
  @Get('zz500/latest')
  async getLatestZz500Data(): Promise<Zz500 | null> {
    return this.stockService.getLatestZz500Data();
  }

  /**
   * 获取中证500指数历史数据
   * @param limit 限制返回的数据条数（默认365条）
   */
  @Get('zz500/history')
  async getZz500History(
    @Query('limit') limit: string = '365',
  ): Promise<Zz500[]> {
    return this.stockService.getZz500History(parseInt(limit, 10));
  }

  /**
   * 获取股债利差数据
   * @param limit 限制返回的数据条数（默认365条，0表示获取所有数据）
   */
  @Get('equity-bond-spread')
  async getEquityBondSpreadData(
    @Query('limit') limit: string = '365',
  ): Promise<any[]> {
    return this.stockService.getEquityBondSpreadData(parseInt(limit, 10));
  }
}
