"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const stock_day_pepb_data_entity_1 = require("../entities/stock-day-pepb-data.entity");
let StockService = class StockService {
    stockRepository;
    constructor(stockRepository) {
        this.stockRepository = stockRepository;
    }
    async findAll() {
        return this.stockRepository.find({
            take: 100,
            order: { date: 'DESC' },
        });
    }
    async findByCode(code) {
        return this.stockRepository.find({
            where: { code },
            order: { date: 'DESC' },
            take: 100,
        });
    }
    async findByCodeAndDateRange(code, startDate, endDate) {
        return this.stockRepository
            .createQueryBuilder('stock')
            .where('stock.code = :code', { code })
            .andWhere('stock.date >= :startDate', { startDate })
            .andWhere('stock.date <= :endDate', { endDate })
            .orderBy('stock.date', 'ASC')
            .getMany();
    }
    async getStockCodes() {
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
    async getLatestStockData(code) {
        return this.stockRepository.findOne({
            where: { code },
            order: { date: 'DESC' },
        });
    }
};
exports.StockService = StockService;
exports.StockService = StockService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(stock_day_pepb_data_entity_1.StockDayPepbData)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], StockService);
//# sourceMappingURL=stock.service.js.map