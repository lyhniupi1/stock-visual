import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('stock_industry_data')
export class StockIndustryData {
  @PrimaryColumn({ type: 'text', name: 'code' })
  code: string;

  @Column({ type: 'text', name: 'codeName', nullable: true })
  codeName: string;

  @Column({ type: 'text', name: 'updateDate' })
  updateDate: string;

  @Column({ type: 'text', name: 'industry', nullable: true })
  industry: string;

  @Column({ type: 'text', name: 'industryClassification', nullable: true })
  industryClassification: string;
}
