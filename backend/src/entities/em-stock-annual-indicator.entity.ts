/**
 * 东方财富年报主要指标（em_stock_annual_indicator 表）
 * 注意：该表的 code 与主表一致，为 "sh.600000" / "sz.000001" 格式
 */
export interface EmStockAnnualIndicator {
  code: string;
  codeName: string;
  reportDate: string;
  reportDateName: string;
  noticeDate: string | null;
  /** 基本每股收益 */
  eps: number | null;
  /** 每股净资产 */
  bps: number | null;
  /** 加权净资产收益率(%) */
  roeJq: number | null;
  /** 扣非加权净资产收益率(%) */
  roeKcjq: number | null;
  /** 投入资本回报率(%) */
  roic: number | null;
  /** 销售毛利率(%) */
  grossMargin: number | null;
  /** 销售净利率(%) */
  netMargin: number | null;
  /** 资产负债率(%) */
  debtRatio: number | null;
  /** 归母净利润(元) */
  parentNetProfit: number | null;
  /** 营业总收入(元) */
  totalOperateRevenue: number | null;
  /** 营业总收入同比增长(%) */
  revenueYoy: number | null;
  /** 归母净利润同比增长(%) */
  netProfitYoy: number | null;
}
