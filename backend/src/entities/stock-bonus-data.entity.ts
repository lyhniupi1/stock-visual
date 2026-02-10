import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('stock_bonus_data')
export class StockBonusData {
  @PrimaryColumn({ type: 'text', name: 'code' })
  code: string;

  @PrimaryColumn({ type: 'text', name: 'dateStr' })
  dateStr: string;

  @Column({ type: 'text', name: 'codeName', nullable: true })
  codeName: string;

  @Column({ type: 'text', name: 'bonusData', nullable: true })
  bonusData: string;

  @Column({ type: 'float', name: 'amount', nullable: true })
  amount: number;

  @Column({ type: 'float', name: 'stockDividend', nullable: true })
  stockDividend: number;
}