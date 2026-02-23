import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('index_valuation_data')
export class IndexValuationData {
  @PrimaryColumn({ type: 'text', name: 'code' })
  code: string;

  @PrimaryColumn({ type: 'text', name: 'date' })
  date: string;

  @Column({ type: 'text', name: 'codeName', nullable: true })
  codeName: string;

  @Column({ type: 'float', name: 'pe', nullable: true })
  pe: number;

  @Column({ type: 'float', name: 'pb', nullable: true })
  pb: number;

  @Column({ type: 'float', name: 'roe', nullable: true })
  roe: number;
}