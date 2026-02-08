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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockDayPepbData = void 0;
const typeorm_1 = require("typeorm");
let StockDayPepbData = class StockDayPepbData {
    code;
    date;
    codeName;
    open;
    high;
    low;
    close;
    preclose;
    volume;
    amount;
    adjustflag;
    turn;
    tradestatus;
    pctChg;
    peTTM;
    pbMRQ;
    psTTM;
    pcfNcfTTM;
    isST;
};
exports.StockDayPepbData = StockDayPepbData;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text', name: 'code' }),
    __metadata("design:type", String)
], StockDayPepbData.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'text', name: 'date' }),
    __metadata("design:type", String)
], StockDayPepbData.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'codeName', nullable: true }),
    __metadata("design:type", String)
], StockDayPepbData.prototype, "codeName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'open', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "open", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'high', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "high", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'low', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "low", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'close', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "close", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'preclose', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "preclose", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'volume', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "volume", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'amount', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'adjustflag', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "adjustflag", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'turn', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "turn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'tradestatus', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "tradestatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'pctChg', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "pctChg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'peTTM', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "peTTM", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'pbMRQ', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "pbMRQ", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'psTTM', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "psTTM", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', name: 'pcfNcfTTM', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "pcfNcfTTM", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', name: 'isST', nullable: true }),
    __metadata("design:type", Number)
], StockDayPepbData.prototype, "isST", void 0);
exports.StockDayPepbData = StockDayPepbData = __decorate([
    (0, typeorm_1.Entity)('stock_day_pepb_data')
], StockDayPepbData);
//# sourceMappingURL=stock-day-pepb-data.entity.js.map