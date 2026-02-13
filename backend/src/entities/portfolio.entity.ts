import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface PortfolioStock {
  code: string;
  name: string;
  quantity: number;
  costPrice: number;
}

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', name: 'name' })
  name: string;

  @Column({ type: 'integer', name: 'stock_count', default: 0 })
  stockCount: number;

  @Column({ type: 'text', name: 'stocks' })
  stocks: string; // JSON字符串存储股票列表

  @Column({ type: 'text', name: 'created_at' })
  createdAt: string;

  @Column({ type: 'float', name: 'initial_value', default: 0 })
  initialValue: number;

  @Column({ type: 'float', name: 'current_value', nullable: true })
  currentValue: number;

  @CreateDateColumn({ type: 'datetime', name: 'created_time' })
  createdTime: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updated_time' })
  updatedTime: Date;

  // 获取解析后的股票列表
  getStockList(): PortfolioStock[] {
    try {
      return JSON.parse(this.stocks) || [];
    } catch {
      return [];
    }
  }

  // 设置股票列表
  setStockList(stocks: PortfolioStock[]): void {
    this.stocks = JSON.stringify(stocks);
    this.stockCount = stocks.length;
  }

  // 计算盈亏百分比
  getProfitPercent(): number {
    if (!this.initialValue || this.initialValue === 0) return 0;
    const current = this.currentValue || this.initialValue;
    return ((current - this.initialValue) / this.initialValue) * 100;
  }
}
