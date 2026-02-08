import { Controller, Get, Query, Param } from '@nestjs/common';
import { StockService } from '../services/stock.service';
import { StockDayPepbData } from '../entities/stock-day-pepb-data.entity';

@Controller('api/stocks')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  async getAllStocks(): Promise<StockDayPepbData[]> {
    return this.stockService.findAll();
  }

  @Get('codes')
  async getStockCodes(): Promise<{ code: string; codeName: string }[]> {
    return this.stockService.getStockCodes();
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
}