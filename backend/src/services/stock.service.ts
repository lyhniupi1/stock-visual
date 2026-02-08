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

  async findByDate(date: string, page: number = 1, pageSize: number = 20): Promise<{
    data: StockDayPepbData[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    // 首先获取该日期的所有股票数据来计算排名
    const allStocks = await this.stockRepository.find({
      where: { date },
    });

    // 分离PE/PB为负数的股票
    const negativePEStocks = allStocks.filter(stock => (stock.peTTM || 0) < 0);
    const negativePBStocks = allStocks.filter(stock => (stock.pbMRQ || 0) < 0);
    
    // 正数PE股票（用于排名）
    const positivePEStocks = allStocks.filter(stock => (stock.peTTM || 0) >= 0);
    // 正数PB股票（用于排名）
    const positivePBStocks = allStocks.filter(stock => (stock.pbMRQ || 0) >= 0);

    // 计算PE排名（只对正数PE排序）
    const peSorted = [...positivePEStocks].sort((a, b) => (a.peTTM || Infinity) - (b.peTTM || Infinity));
    // 计算PB排名（只对正数PB排序）
    const pbSorted = [...positivePBStocks].sort((a, b) => (a.pbMRQ || Infinity) - (b.pbMRQ || Infinity));

    // 创建排名映射
    const peRankMap = new Map<string, number>();
    const pbRankMap = new Map<string, number>();

    // 正数PE股票获得正常排名
    peSorted.forEach((stock, index) => {
      peRankMap.set(stock.code, index + 1);
    });

    // 正数PB股票获得正常排名
    pbSorted.forEach((stock, index) => {
      pbRankMap.set(stock.code, index + 1);
    });

    // 计算综合排名（PE排名 + PB排名）
    const stocksWithRank = allStocks.map(stock => {
      // PE为负数的排名设为9999
      const peRank = (stock.peTTM || 0) < 0 ? 9999 : (peRankMap.get(stock.code) || (positivePEStocks.length + 1));
      // PB为负数的排名设为9999
      const pbRank = (stock.pbMRQ || 0) < 0 ? 9999 : (pbRankMap.get(stock.code) || (positivePBStocks.length + 1));
      
      return {
        ...stock,
        peRank,
        pbRank,
        totalRank: peRank + pbRank,
      };
    });

    // 按综合排名升序排序
    stocksWithRank.sort((a, b) => a.totalRank - b.totalRank);

    // 分页
    const total = stocksWithRank.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = stocksWithRank.slice(startIndex, endIndex);

    // 移除排名字段，返回原始数据结构
    const data = paginatedData.map(({ peRank, pbRank, totalRank, ...stock }) => stock);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getStockHistory(code: string, limit: number = 365): Promise<StockDayPepbData[]> {
    const queryOptions: any = {
      where: { code },
      order: { date: 'ASC' }, // 按日期升序排列，便于绘制K线图
    };
    
    // 如果limit大于0，则限制返回数量；否则返回全部数据
    if (limit > 0) {
      queryOptions.take = limit;
    }
    
    return this.stockRepository.find(queryOptions);
  }
}