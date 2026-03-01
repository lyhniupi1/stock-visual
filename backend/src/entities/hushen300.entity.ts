import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('hushen300')
export class Hushen300 {
  @PrimaryColumn({ type: 'text', name: 'date' })
  date: string;

  @Column({ type: 'text', name: 'code', nullable: true })
  code: string;

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

  @Column({ type: 'float', name: 'pctChg', nullable: true })
  pctChg: number;
}