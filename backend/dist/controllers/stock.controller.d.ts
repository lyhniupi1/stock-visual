import { StockService } from '../services/stock.service';
import { StockDayPepbData } from '../entities/stock-day-pepb-data.entity';
export declare class StockController {
    private readonly stockService;
    constructor(stockService: StockService);
    getAllStocks(): Promise<StockDayPepbData[]>;
    getStockCodes(): Promise<{
        code: string;
        codeName: string;
    }[]>;
    getStockByCode(code: string): Promise<StockDayPepbData[]>;
    getLatestStockData(code: string): Promise<StockDayPepbData | null>;
    getStockByDateRange(code: string, startDate: string, endDate: string): Promise<StockDayPepbData[]>;
    getStocksByDate(date: string, page?: string, pageSize?: string): Promise<{
        data: StockDayPepbData[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    getStockHistory(code: string, limit?: string): Promise<StockDayPepbData[]>;
}
