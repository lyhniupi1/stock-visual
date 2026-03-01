'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchMultipleStocksByDateRange, StockData, fetchHushen300ByDateRange, Hushen300Data } from '@/lib/api';

interface PortfolioChartProps {
  stockCodes: string[];
  startDate: string;
  endDate: string;
}

interface ChartDataPoint {
  time: string;
  value: number;
}

const PortfolioChart = ({ stockCodes, startDate, endDate }: PortfolioChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const peChartContainerRef = useRef<HTMLDivElement>(null);
  const peChartRef = useRef<any>(null);
  const pbChartContainerRef = useRef<HTMLDivElement>(null);
  const pbChartRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [medianPEData, setMedianPEData] = useState<ChartDataPoint[]>([]);
  const [medianPBData, setMedianPBData] = useState<ChartDataPoint[]>([]);
  const [stocksRawData, setStocksRawData] = useState<Record<string, StockData[]>>({});
  const [hushen300Data, setHushen300Data] = useState<Hushen300Data[]>([]);
  const [hushen300NetValue, setHushen300NetValue] = useState<ChartDataPoint[]>([]);

  // 获取数据并计算等权重净值
  useEffect(() => {
    const loadData = async () => {
      if (!stockCodes.length || !startDate || !endDate) return;

      setLoading(true);
      setError(null);
      try {
        // 并行获取股票数据和沪深300数据
        const [stocksData, hushen300DataResult] = await Promise.all([
          fetchMultipleStocksByDateRange(stockCodes, startDate, endDate),
          fetchHushen300ByDateRange(startDate, endDate)
        ]);

        // 存储原始数据
        setStocksRawData(stocksData);
        setHushen300Data(hushen300DataResult);

        // 计算等权重净值
        const netValueData = calculateEqualWeightNetValue(stocksData);
        setChartData(netValueData);

        // 计算沪深300的净值变化，首日设置为1
        const hushen300NetValueData = calculateHushen300NetValue(hushen300DataResult);
        setHushen300NetValue(hushen300NetValueData);

        // 计算PE和PB中位数
        const { medianPE, medianPB } = calculateMedianPEAndPB(stocksData);
        setMedianPEData(medianPE);
        setMedianPBData(medianPB);

        //新增两个图，一个组合的pe中位数图，一个pb中位数图，使用stocksData的数据
      } catch (err) {
        console.error('Failed to load portfolio data:', err);
        setError('无法加载组合数据');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [stockCodes, startDate, endDate]);

  // 计算等权重净值
  // 算法：每天计算所有股票收盘价的平均值 Pn，第一天的平均值为 P1，净值 = Pn / P1
  const calculateEqualWeightNetValue = (
    stocksData: Record<string, StockData[]>
  ): ChartDataPoint[] => {
    const stockCodesList = Object.keys(stocksData);
    if (stockCodesList.length === 0) return [];

    // 收集所有日期
    const allDatesSet = new Set<string>();
    for (const code of stockCodesList) {
      const stockData = stocksData[code];
      if (stockData && stockData.length > 0) {
        for (const data of stockData) {
          allDatesSet.add(data.date);
        }
      }
    }
    const allDates = Array.from(allDatesSet).sort();
    if (allDates.length === 0) return [];

    // 为每只股票构建日期到数据的映射
    const stockDateMap: Record<string, Record<string, StockData>> = {};
    for (const code of stockCodesList) {
      stockDateMap[code] = {};
      const stockData = stocksData[code];
      if (stockData) {
        for (const data of stockData) {
          stockDateMap[code][data.date] = data;
        }
      }
    }

    // 计算每天的等权重收盘价平均值
    const dailyAvgPrices: { date: string; avgPrice: number }[] = [];
    
    for (const date of allDates) {
      let sumClose = 0;
      let validCount = 0;

      for (const code of stockCodesList) {
        const data = stockDateMap[code][date];
        if (data && data.close > 0) {
          sumClose += data.close;
          validCount++;
        }
      }

      if (validCount > 0) {
        dailyAvgPrices.push({
          date,
          avgPrice: sumClose / validCount,
        });
      }
    }

    if (dailyAvgPrices.length === 0) return [];

    // 以第一天的平均价格作为基准计算净值
    const basePrice = dailyAvgPrices[0].avgPrice;
    
    const portfolioNetValues: ChartDataPoint[] = dailyAvgPrices.map(item => ({
      time: item.date,
      value: basePrice > 0 ? item.avgPrice / basePrice : 1,
    }));

    return portfolioNetValues;
  };

  // 计算沪深300净值变化（首日设置为1）
  const calculateHushen300NetValue = (hushen300Data: Hushen300Data[]): ChartDataPoint[] => {
    if (hushen300Data.length === 0) return [];

    // 按日期排序
    const sortedData = hushen300Data.slice().sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 以第一天的收盘价作为基准
    const basePrice = sortedData[0].close;

    return sortedData.map(data => ({
      time: data.date,
      value: basePrice > 0 ? data.close / basePrice : 1,
    }));
  };

  // 计算PE和PB中位数
  const calculateMedianPEAndPB = (
    stocksData: Record<string, StockData[]>
  ): { medianPE: ChartDataPoint[]; medianPB: ChartDataPoint[] } => {
    const stockCodesList = Object.keys(stocksData);
    if (stockCodesList.length === 0) return { medianPE: [], medianPB: [] };

    // 收集所有日期
    const allDatesSet = new Set<string>();
    for (const code of stockCodesList) {
      const stockData = stocksData[code];
      if (stockData && stockData.length > 0) {
        for (const data of stockData) {
          allDatesSet.add(data.date);
        }
      }
    }
    const allDates = Array.from(allDatesSet).sort();
    if (allDates.length === 0) return { medianPE: [], medianPB: [] };

    // 为每只股票构建日期到数据的映射
    const stockDateMap: Record<string, Record<string, StockData>> = {};
    for (const code of stockCodesList) {
      stockDateMap[code] = {};
      const stockData = stocksData[code];
      if (stockData) {
        for (const data of stockData) {
          stockDateMap[code][data.date] = data;
        }
      }
    }

    // 计算每天的PE中位数和PB中位数
    const medianPE: ChartDataPoint[] = [];
    const medianPB: ChartDataPoint[] = [];

    for (const date of allDates) {
      const peValues: number[] = [];
      const pbValues: number[] = [];

      for (const code of stockCodesList) {
        const data = stockDateMap[code][date];
        if (data && data.peTTM > 0) {
          peValues.push(data.peTTM);
        }
        if (data && data.pbMRQ > 0) {
          pbValues.push(data.pbMRQ);
        }
      }

      // 计算中位数
      const calculateMedian = (arr: number[]): number => {
        if (arr.length === 0) return 0;
        const sorted = arr.slice().sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
          return (sorted[mid - 1] + sorted[mid]) / 2;
        } else {
          return sorted[mid];
        }
      };

      const medianPeValue = calculateMedian(peValues);
      const medianPbValue = calculateMedian(pbValues);

      if (medianPeValue > 0) {
        medianPE.push({ time: date, value: medianPeValue });
      }
      if (medianPbValue > 0) {
        medianPB.push({ time: date, value: medianPbValue });
      }
    }

    return { medianPE, medianPB };
  };

  // 初始化图表
  useEffect(() => {
    if (!chartContainerRef.current || chartData.length === 0) return;

    const initChart = async () => {
      // 动态导入 lightweight-charts
      const lwc = await import('lightweight-charts');
      const { createChart, LineStyle } = lwc;

      // 清除现有图表
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (err) {
          console.log('Chart already disposed');
        }
        chartRef.current = null;
      }

      const container = chartContainerRef.current;
      if (!container) return;

      const chart = createChart(container, {
        width: container.clientWidth,
        height: 400,
        layout: {
          background: { color: '#ffffff' },
          textColor: '#333333',
        },
        grid: {
          vertLines: { color: '#e0e0e0' },
          horzLines: { color: '#e0e0e0' },
        },
        crosshair: {
          mode: lwc.CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: '#e0e0e0',
        },
        timeScale: {
          borderColor: '#e0e0e0',
          timeVisible: false,
        },
      });

      chartRef.current = chart;

      // 添加组合净值面积图
      const areaSeries = chart.addSeries(lwc.AreaSeries, {
        topColor: 'rgba(59, 130, 246, 0.3)',
        bottomColor: 'rgba(59, 130, 246, 0.05)',
        lineColor: '#3b82f6',
        lineWidth: 2,
        title: '等权重净值',
      });

      // 转换时间为时间戳格式
      const formattedData = chartData.map(d => ({
        time: (new Date(d.time).getTime() / 1000) as any,
        value: d.value,
      }));

      areaSeries.setData(formattedData);
      seriesRef.current = areaSeries;

      // 添加基准线（净值为1）- 使用 LineSeries
      const baselineSeries = chart.addSeries(lwc.LineSeries, {
        color: '#9ca3af',
        lineWidth: 1,
        lineStyle: lwc.LineStyle.Dashed,
        title: '基准线 (1.0)',
        lastValueVisible: false,
        priceLineVisible: false,
      });

      const baselineData = chartData.map(d => ({
        time: (new Date(d.time).getTime() / 1000) as any,
        value: 1,
      }));
      baselineSeries.setData(baselineData);

      // 添加沪深300净值线（如果存在数据）
      if (hushen300NetValue.length > 0) {
        const hushen300Series = chart.addSeries(lwc.LineSeries, {
          color: '#f97316', // 橙色
          lineWidth: 2,
          lineStyle: lwc.LineStyle.Solid,
          title: '沪深300净值',
          lastValueVisible: true,
          priceLineVisible: false,
        });

        const hushen300FormattedData = hushen300NetValue.map(d => ({
          time: (new Date(d.time).getTime() / 1000) as any,
          value: d.value,
        }));
        hushen300Series.setData(hushen300FormattedData);
      }

      // 适应内容
      chart.timeScale().fitContent();
    };

    initChart();

    // 处理窗口大小变化
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (err) {
          console.log('Chart already disposed');
        }
        chartRef.current = null;
      }
    };
  }, [chartData, medianPEData, medianPBData, hushen300NetValue]);

  // 初始化PE中位数图表
  useEffect(() => {
    if (!peChartContainerRef.current || medianPEData.length === 0) return;

    const initChart = async () => {
      const lwc = await import('lightweight-charts');
      const { createChart } = lwc;

      if (peChartRef.current) {
        try {
          peChartRef.current.remove();
        } catch (err) {
          console.log('PE Chart already disposed');
        }
        peChartRef.current = null;
      }

      const container = peChartContainerRef.current;
      if (!container) return;

      const chart = createChart(container, {
        width: container.clientWidth,
        height: 300,
        layout: {
          background: { color: '#ffffff' },
          textColor: '#333333',
        },
        grid: {
          vertLines: { color: '#e0e0e0' },
          horzLines: { color: '#e0e0e0' },
        },
        crosshair: {
          mode: lwc.CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: '#e0e0e0',
        },
        timeScale: {
          borderColor: '#e0e0e0',
          timeVisible: false,
        },
      });

      peChartRef.current = chart;

      const peSeries = chart.addSeries(lwc.LineSeries, {
        color: '#10b981',
        lineWidth: 2,
        title: 'PE中位数',
        lastValueVisible: true,
        priceLineVisible: false,
      });

      const peFormattedData = medianPEData.map(d => ({
        time: (new Date(d.time).getTime() / 1000) as any,
        value: d.value,
      }));
      peSeries.setData(peFormattedData);

      chart.timeScale().fitContent();
    };

    initChart();

    const handleResize = () => {
      if (peChartRef.current && peChartContainerRef.current) {
        peChartRef.current.applyOptions({
          width: peChartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (peChartRef.current) {
        try {
          peChartRef.current.remove();
        } catch (err) {
          console.log('PE Chart already disposed');
        }
        peChartRef.current = null;
      }
    };
  }, [medianPEData]);

  // 初始化PB中位数图表
  useEffect(() => {
    if (!pbChartContainerRef.current || medianPBData.length === 0) return;

    const initChart = async () => {
      const lwc = await import('lightweight-charts');
      const { createChart } = lwc;

      if (pbChartRef.current) {
        try {
          pbChartRef.current.remove();
        } catch (err) {
          console.log('PB Chart already disposed');
        }
        pbChartRef.current = null;
      }

      const container = pbChartContainerRef.current;
      if (!container) return;

      const chart = createChart(container, {
        width: container.clientWidth,
        height: 300,
        layout: {
          background: { color: '#ffffff' },
          textColor: '#333333',
        },
        grid: {
          vertLines: { color: '#e0e0e0' },
          horzLines: { color: '#e0e0e0' },
        },
        crosshair: {
          mode: lwc.CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: '#e0e0e0',
        },
        timeScale: {
          borderColor: '#e0e0e0',
          timeVisible: false,
        },
      });

      pbChartRef.current = chart;

      const pbSeries = chart.addSeries(lwc.LineSeries, {
        color: '#8b5cf6',
        lineWidth: 2,
        title: 'PB中位数',
        lastValueVisible: true,
        priceLineVisible: false,
      });

      const pbFormattedData = medianPBData.map(d => ({
        time: (new Date(d.time).getTime() / 1000) as any,
        value: d.value,
      }));
      pbSeries.setData(pbFormattedData);

      chart.timeScale().fitContent();
    };

    initChart();

    const handleResize = () => {
      if (pbChartRef.current && pbChartContainerRef.current) {
        pbChartRef.current.applyOptions({
          width: pbChartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (pbChartRef.current) {
        try {
          pbChartRef.current.remove();
        } catch (err) {
          console.log('PB Chart already disposed');
        }
        pbChartRef.current = null;
      }
    };
  }, [medianPBData]);

  // 计算统计数据（包含组合和沪深300）
  const getStats = () => {
    if (chartData.length < 2) return null;

    const startValue = chartData[0].value;
    const endValue = chartData[chartData.length - 1].value;
    const totalReturn = ((endValue - startValue) / startValue) * 100;

    // 计算最大回撤
    let maxDrawdown = 0;
    let peak = chartData[0].value;
    for (const point of chartData) {
      if (point.value > peak) {
        peak = point.value;
      }
      const drawdown = ((peak - point.value) / peak) * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    // 计算年化收益率（使用实际日期差，而不是交易日数量）
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const years = days / 365;
    const annualizedReturn = years > 0
      ? ((Math.pow(endValue / startValue, 1 / years) - 1) * 100)
      : 0;

    // 计算沪深300统计数据
    let hushen300Stats = null;
    if (hushen300NetValue.length >= 2) {
      const hsStartValue = hushen300NetValue[0].value;
      const hsEndValue = hushen300NetValue[hushen300NetValue.length - 1].value;
      const hsTotalReturn = ((hsEndValue - hsStartValue) / hsStartValue) * 100;

      // 计算最大回撤
      let hsMaxDrawdown = 0;
      let hsPeak = hushen300NetValue[0].value;
      for (const point of hushen300NetValue) {
        if (point.value > hsPeak) {
          hsPeak = point.value;
        }
        const drawdown = ((hsPeak - point.value) / hsPeak) * 100;
        if (drawdown > hsMaxDrawdown) {
          hsMaxDrawdown = drawdown;
        }
      }

      // 计算年化收益率（使用相同的日期差）
      const hsAnnualizedReturn = years > 0
        ? ((Math.pow(hsEndValue / hsStartValue, 1 / years) - 1) * 100)
        : 0;

      hushen300Stats = {
        totalReturn: hsTotalReturn,
        maxDrawdown: hsMaxDrawdown,
        annualizedReturn: hsAnnualizedReturn,
        days,
      };
    }

    return {
      portfolio: {
        totalReturn,
        maxDrawdown,
        annualizedReturn,
        days,
      },
      hushen300: hushen300Stats,
    };
  };

  const stats = getStats();


  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 组合等权重净值走势</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载图表数据...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 组合等权重净值走势</h3>
        <div className="flex items-center justify-center h-64 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 组合等权重净值走势</h3>
        <div className="flex items-center justify-center h-64 text-gray-500">
          暂无数据
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">📈 组合等权重净值走势</h3>
          <p className="text-sm text-gray-500 mt-1">
            {startDate} 至 {endDate} · 共 {stockCodes.length} 只股票
          </p>
        </div>
        {stats && (
          <div className="flex flex-col gap-4">
            {/* 组合统计信息 */}
            <div className="flex gap-4 text-sm">
              <div className="text-right">
                <div className="text-gray-500">组合总收益率</div>
                <div className={`font-semibold ${stats.portfolio.totalReturn >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.portfolio.totalReturn >= 0 ? '+' : ''}{stats.portfolio.totalReturn.toFixed(2)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">组合最大回撤</div>
                <div className="font-semibold text-orange-600">
                  -{stats.portfolio.maxDrawdown.toFixed(2)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">组合年化收益</div>
                <div className={`font-semibold ${stats.portfolio.annualizedReturn >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {stats.portfolio.annualizedReturn >= 0 ? '+' : ''}{stats.portfolio.annualizedReturn.toFixed(2)}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-gray-500">持仓天数</div>
                <div className="font-semibold text-blue-600">
                  {stats.portfolio.days}天
                </div>
              </div>
            </div>

            {/* 沪深300对比统计信息 */}
            {stats.hushen300 && (
              <div className="flex gap-4 text-sm border-t pt-3">
                <div className="text-right">
                  <div className="text-gray-500">沪深300总收益率</div>
                  <div className={`font-semibold ${stats.hushen300.totalReturn >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.hushen300.totalReturn >= 0 ? '+' : ''}{stats.hushen300.totalReturn.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500">沪深300最大回撤</div>
                  <div className="font-semibold text-orange-600">
                    -{stats.hushen300.maxDrawdown.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500">沪深300年化收益</div>
                  <div className={`font-semibold ${stats.hushen300.annualizedReturn >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {stats.hushen300.annualizedReturn >= 0 ? '+' : ''}{stats.hushen300.annualizedReturn.toFixed(2)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-gray-500">持仓天数</div>
                  <div className="font-semibold text-blue-600">
                    {stats.hushen300.days}天
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div ref={chartContainerRef} className="w-full" />
      
      {/* PE中位数图表 */}
      {medianPEData.length > 0 && (
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-700 mb-2">📊 PE中位数走势</h4>
          <div ref={peChartContainerRef} className="w-full" />
          <div className="mt-2 flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500"></div>
              <span>PE中位数</span>
            </div>
          </div>
        </div>
      )}
      
      {/* PB中位数图表 */}
      {medianPBData.length > 0 && (
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-700 mb-2">📊 PB中位数走势</h4>
          <div ref={pbChartContainerRef} className="w-full" />
          <div className="mt-2 flex items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-purple-500"></div>
              <span>PB中位数</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span>等权重净值</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gray-400 border-dashed" style={{ borderTop: '1px dashed #9ca3af' }}></div>
          <span>基准线 (1.0)</span>
        </div>
        {medianPEData.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-green-500"></div>
            <span>PE中位数</span>
          </div>
        )}
        {medianPBData.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-purple-500"></div>
            <span>PB中位数</span>
          </div>
        )}
        {hushen300NetValue.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-orange-500"></div>
            <span>沪深300净值</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioChart;
