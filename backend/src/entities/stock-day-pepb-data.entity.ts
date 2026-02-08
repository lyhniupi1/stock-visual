import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('stock_day_pepb_data')
export class StockDayPepbData {
  @PrimaryColumn({ type: 'text', name: 'code' })
  code: string;

  @PrimaryColumn({ type: 'text', name: 'date' })
  date: string;

  @Column({ type: 'text', name: 'codeName', nullable: true })
  codeName: string;

  @Column({ type: 'float', name: 'open', nullable: true })
  open: number;

  @Column({ type: 'float', name: 'high', nullable: true })
  high: number;

  @Column({ type: 'float', name: 'low', nullable: true })
  low: number;

  @Column({ type: 'float', name: 'close', nullable: true })
  close: number;

  @Column({ type: 'float', name: 'preclose', nullable: true })
  preclose: number;

  @Column({ type: 'int', name: 'volume', nullable: true })
  volume: number;

  @Column({ type: 'float', name: 'amount', nullable: true })
  amount: number;

  @Column({ type: 'int', name: 'adjustflag', nullable: true })
  adjustflag: number;

  @Column({ type: 'float', name: 'turn', nullable: true })
  turn: number;

  @Column({ type: 'int', name: 'tradestatus', nullable: true })
  tradestatus: number;

  @Column({ type: 'float', name: 'pctChg', nullable: true })
  pctChg: number;

  @Column({ type: 'float', name: 'peTTM', nullable: true })
  peTTM: number;

  @Column({ type: 'float', name: 'pbMRQ', nullable: true })
  pbMRQ: number;

  @Column({ type: 'float', name: 'psTTM', nullable: true })
  psTTM: number;

  @Column({ type: 'float', name: 'pcfNcfTTM', nullable: true })
  pcfNcfTTM: number;

  @Column({ type: 'int', name: 'isST', nullable: true })
  isST: number;
}