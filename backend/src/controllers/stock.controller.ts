import { Controller, Get, Post, Query, Param, Body } from '@nestjs/common';
import { StockBetterService } from '../services/stock-better.service';
import { StockDayPepbData } from '../entities/stock-day-pepb-data.entity';
import { StockBonusData } from '../entities/stock-bonus-data.entity';
import { IndexValuationData } from '../entities/index-valuation-data.entity';
import { DividendRatioData } from '../entities/eastmoney-dividend-ratio.entity';

@Controller('api/stocks')
export class StockController {
  constructor(private readonly stockService: StockBetterService) {}

  @Get()
  async getAllStocks(): Promise<StockDayPepbData[]> {
    return this.stockService.findAll();
  }

  @Get('codes')
  async getStockCodes(): Promise<{ code: string; codeName: string }[]> {
    return this.stockService.getStockCodes();
  }

  @Get('search')
  async searchStocks(
    @Query('q') query: string,
    @Query('limit') limit: string = '20',
  ): Promise<{ code: string; codeName: string }[]> {
    return this.stockService.searchStocks(query, parseInt(limit, 10));
  }

  @Get(':code')
  async getStockByCode(
    @Param('code') code: string,
  ): Promise<StockDayPepbData[]> {
    return this.stockService.findByCode(code);
  }

  @Get(':code/latest')
  async getLatestStockData(
    @Param('code') code: string,
  ): Promise<StockDayPepbData | null> {
    return this.stockService.getLatestStockData(code);
  }

  @Get(':code/range')
  async getStockByDateRange(
    @Param('code') code: string,
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ): Promise<StockDayPepbData[]> {
    return this.stockService.findByCodeAndDateRange(code, startDate, endDate);
  }

  @Get('date/:date')
  async getStocksByDate(
    @Param('date') date: string,
    @Query('page') page: string = '1',
    @Query('pageSize') pageSize: string = '20',
  ): Promise<{
    data: StockDayPepbData[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    return this.stockService.findByDate(
      date,
      parseInt(page, 10),
      parseInt(pageSize, 10),
    );
  }

  @Get(':code/history')
  async getStockHistory(
    @Param('code') code: string,
    @Query('limit') limit: string = '365',
  ): Promise<StockDayPepbData[]> {
    return this.stockService.getStockHistory(code, parseInt(limit, 10));
  }

  @Get(':code/bonus')
  async getStockBonusData(
    @Param('code') code: string,
  ): Promise<StockBonusData[]> {
    return this.stockService.getStockBonusData(code);
  }

  @Get(':code/bonus/latest')
  async getLatestStockBonusData(
    @Param('code') code: string,
  ): Promise<StockBonusData | null> {
    return this.stockService.getLatestStockBonusData(code);
  }

  @Post('batch/range')
  async getMultipleStocksByDateRange(
    @Body() body: { codes: string[]; startDate: string; endDate: string },
  ): Promise<Record<string, StockDayPepbData[]>> {
    const result = await this.stockService.findMultipleStocksByDateRange(
      body.codes,
      body.startDate,
      body.endDate,
    );
    // 将Map转换为普通对象
    const obj: Record<string, StockDayPepbData[]> = {};
    result.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  @Post('batch/date')
  async getMultipleStocksByDate(
    @Body() body: { codes: string[]; date: string },
  ): Promise<Record<string, StockDayPepbData | null>> {
    const result = await this.stockService.findMultipleStocksByDate(
      body.codes,
      body.date,
    );
    // 将Map转换为普通对象
    const obj: Record<string, StockDayPepbData | null> = {};
    result.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  @Get('index/valuation')
  async getIndexValuationData(
    @Query('code') code?: string,
    @Query('limit') limit?: string,
  ): Promise<IndexValuationData[]> {
    const limitNum = limit ? parseInt(limit, 10) : 0;
    return this.stockService.getIndexValuationData(code, limitNum);
  }

  @Get('index/codes')
  async getIndexCodes(): Promise<{ code: string; codeName: string }[]> {
    return this.stockService.getIndexCodes();
  }

  @Get('index/date-range')
  async getIndexValuationDateRange(
    @Query('code') code?: string,
  ): Promise<{ minDate: string; maxDate: string }> {
    return this.stockService.getIndexValuationDateRange(code);
  }

  @Post('batch/compare')
  async getMultipleStocksByTwoDates(
    @Body() body: { codes: string[]; t1: string; t2: string },
  ): Promise<Record<string, { t1: StockDayPepbData | null; t2: StockDayPepbData | null }>> {
    const result = await this.stockService.findMultipleStocksByTwoDates(
      body.codes,
      body.t1,
      body.t2,
    );
    // 将Map转换为普通对象
    const obj: Record<string, { t1: StockDayPepbData | null; t2: StockDayPepbData | null }> = {};
    result.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  }

  @Get(':code/dividend-ratio')
  async getDividendRatioHistory(
    @Param('code') code: string,
  ): Promise<DividendRatioData[]> {
    return this.stockService.getDividendRatioHistory(code);
  }

  @Get(':code/dividend-ratio/latest')
  async getLatestDividendRatio(
    @Param('code') code: string,
  ): Promise<DividendRatioData | null> {
    return this.stockService.getLatestDividendRatio(code);
  }

  @Get(':code/eps-predict')
  async getEpsPredictData(
    @Param('code') code: string,
  ): Promise<any[]> {
    return this.stockService.getEpsPredictData(code);
  }

  @Get(':code/eps-predict/latest')
  async getLatestEpsPredictData(
    @Param('code') code: string,
  ): Promise<any[]> {
    return this.stockService.getLatestEpsPredictData(code);
  }
}