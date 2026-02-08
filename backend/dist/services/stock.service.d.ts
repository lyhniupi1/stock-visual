import { Repository } from 'typeorm';
import { StockDayPepbData } from '../entities/stock-day-pepb-data.entity';
export declare class StockService {
    private stockRepository;
    constructor(stockRepository: Repository<StockDayPepbData>);
    findAll(): Promise<StockDayPepbData[]>;
    findByCode(code: string): Promise<StockDayPepbData[]>;
    findByCodeAndDateRange(code: string, startDate: string, endDate: string): Promise<StockDayPepbData[]>;
    getStockCodes(): Promise<{
        code: string;
        codeName: string;
    }[]>;
    getLatestStockData(code: string): Promise<StockDayPepbData | null>;
    findByDate(date: string): Promise<StockDayPepbData[]>;
}
