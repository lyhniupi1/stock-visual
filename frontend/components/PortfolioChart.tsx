'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchMultipleStocksByDateRange, StockData } from '@/lib/api';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // 获取数据并计算等权重净值
  useEffect(() => {
    const loadData = async () => {
      if (!stockCodes.length || !startDate || !endDate) return;

      setLoading(true);
      setError(null);
      try {
        // 获取所有股票在日期范围内的数据
        const stocksData = await fetchMultipleStocksByDateRange(stockCodes, startDate, endDate);
        
        // 计算等权重净值
        const netValueData = calculateEqualWeightNetValue(stocksData);
        setChartData(netValueData);
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
  }, [chartData]);

  // 计算统计数据
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

    // 计算年化收益率
    const days = chartData.length;
    const years = days / 365;
    const annualizedReturn = years > 0 
      ? ((Math.pow(endValue / startValue, 1 / years) - 1) * 100)
      : 0;

    return {
      totalReturn,
      maxDrawdown,
      annualizedReturn,
      days,
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
          <div className="flex gap-4 text-sm">
            <div className="text-right">
              <div className="text-gray-500">总收益率</div>
              <div className={`font-semibold ${stats.totalReturn >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.totalReturn >= 0 ? '+' : ''}{stats.totalReturn.toFixed(2)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-500">最大回撤</div>
              <div className="font-semibold text-orange-600">
                -{stats.maxDrawdown.toFixed(2)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-gray-500">年化收益</div>
              <div className={`font-semibold ${stats.annualizedReturn >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.annualizedReturn >= 0 ? '+' : ''}{stats.annualizedReturn.toFixed(2)}%
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div ref={chartContainerRef} className="w-full" />
      
      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span>等权重净值</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gray-400 border-dashed" style={{ borderTop: '1px dashed #9ca3af' }}></div>
          <span>基准线 (1.0)</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioChart;
