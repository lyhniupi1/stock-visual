export interface EastmoneyDividendRatio {
  secucode: string;
  securityNameAbbr: string;
  reportDate: string;
  parentNetProfit: number | null;
  dividendImple: number | null;
  dividendPlan: number | null;
  dividendPayImple: number | null;
  dividendPayPlan: number | null;
}

export interface DividendRatioData {
  code: string;
  date: string;
  codeName: string;
  dividendPayRatio: number | null;
  dividendImple: number | null;
  parentNetProfit: number | null;
}