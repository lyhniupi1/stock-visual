import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StockDayPepbData } from '../entities/stock-day-pepb-data.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockDayPepbData)
    private stockRepository: Repository<StockDayPepbData>,
  ) {}

  async findAll(): Promise<StockDayPepbData[]> {
    return this.stockRepository.find({
      take: 100,
      order: { date: 'DESC' },
    });
  }

  async findByCode(code: string): Promise<StockDayPepbData[]> {
    return this.stockRepository.find({
      where: { code },
      order: { date: 'DESC' },
      take: 100,
    });
  }

  async findByCodeAndDateRange(
    code: string,
    startDate: string,
    endDate: string,
  ): Promise<StockDayPepbData[]> {
    return this.stockRepository
      .createQueryBuilder('stock')
      .where('stock.code = :code', { code })
      .andWhere('stock.date >= :startDate', { startDate })
      .andWhere('stock.date <= :endDate', { endDate })
      .orderBy('stock.date', 'ASC')
      .getMany();
  }

  async getStockCodes(): Promise<{ code: string; codeName: string }[]> {
    const results = await this.stockRepository
      .createQueryBuilder('stock')
      .select('DISTINCT stock.code', 'code')
      .addSelect('stock.codeName', 'codeName')
      .where('stock.codeName IS NOT NULL')
      .getRawMany();
    
    return results.map(row => ({
      code: row.code,
      codeName: row.codeName,
    }));
  }

  async getLatestStockData(code: string): Promise<StockDayPepbData | null> {
    return this.stockRepository.findOne({
      where: { code },
      order: { date: 'DESC' },
    });
  }

  async findByDate(date: string): Promise<StockDayPepbData[]> {
    return this.stockRepository.find({
      where: { date },
      order: { code: 'ASC' },
    });
  }
}