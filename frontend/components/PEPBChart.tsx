'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchStockHistory, StockData } from '@/lib/api';
import * as lwc from 'lightweight-charts';

interface PEPBChartProps {
  stockCode: string;
  stockName?: string;
  limit?: number;
}

const PEPBChart = ({ stockCode, stockName = '', limit = 0 }: PEPBChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crosshairData, setCrosshairData] = useState<{
    time: string;
    peTTM: number;
    pbMRQ: number;
  } | null>(null);
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('1Y');

  useEffect(() => {
    const loadStockData = async () => {
      try {
        setLoading(true);
        const data = await fetchStockHistory(stockCode, limit);
        setStockData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load stock data:', err);
        setError('无法加载股票历史数据');
        // 使用模拟数据作为后备
        setStockData(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    loadStockData();
  }, [stockCode, limit]);

  // 处理时间范围变化
  const handleTimeRangeChange = (range: '1M' | '3M' | '6M' | '1Y' | 'ALL') => {
    setTimeRange(range);
    // 这里可以根据时间范围过滤数据
    // 目前先不实现过滤，因为API已经返回所有数据
  };

  useEffect(() => {
    if (!chartContainerRef.current || stockData.length === 0) return;

    const container = chartContainerRef.current;
    if (!container) return;

    // 清理之前的图表
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const initChart = () => {
      // 创建图表实例
      const chart = lwc.createChart(container, {
        width: container.clientWidth,
        height: 500,
        layout: {
          background: { color: '#ffffff' },
          textColor: '#374151',
        },
        grid: {
          vertLines: { color: '#e5e7eb' },
          horzLines: { color: '#e5e7eb' },
        },
        crosshair: {
          mode: lwc.CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor: '#d1d5db',
        },
        timeScale: {
          borderColor: '#d1d5db',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      // 准备PE数据
      const peData = stockData.map(item => ({
        time: (new Date(item.date).getTime() / 1000) as any,
        value: item.peTTM || 0,
      }));

      // 准备PB数据
      const pbData = stockData.map(item => ({
        time: (new Date(item.date).getTime() / 1000) as any,
        value: item.pbMRQ || 0,
      }));

      // 添加PE系列 - 使用线图
      const peSeries = chart.addSeries(lwc.LineSeries, {
        color: '#3b82f6',
        lineWidth: 2,
        title: 'PE(TTM)',
      });

      // 添加PB系列 - 使用线图
      const pbSeries = chart.addSeries(lwc.LineSeries, {
        color: '#10b981',
        lineWidth: 2,
        title: 'PB(MRQ)',
      });

      // 设置数据
      peSeries.setData(peData);
      pbSeries.setData(pbData);

      // 添加标题
      chart.applyOptions({
        layout: {
          textColor: '#374151',
        },
      });

      // 订阅十字线移动事件
      chart.subscribeCrosshairMove((param: any) => {
        if (param.time) {
          const timestamp = param.time;
          const dataPoint = findDataPointByTime(stockData, timestamp);
          
          if (dataPoint) {
            setCrosshairData({
              time: formatDateForDisplay(dataPoint.date),
              peTTM: dataPoint.peTTM,
              pbMRQ: dataPoint.pbMRQ,
            });
          }
        } else {
          // 显示最新数据
          updateCrosshairWithLatestData();
        }
      });

      // 设置初始十字线数据
      updateCrosshairWithLatestData();

      // 处理窗口大小变化
      const handleResize = () => {
        if (chart && container) {
          chart.applyOptions({
            width: container.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);
    };

    const updateCrosshairWithLatestData = () => {
      const latestData = stockData[stockData.length - 1];
      if (latestData) {
        setCrosshairData({
          time: formatDateForDisplay(latestData.date),
          peTTM: latestData.peTTM,
          pbMRQ: latestData.pbMRQ,
        });
      }
    };

    initChart();

    return () => {
      window.removeEventListener('resize', () => {});
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [stockData, stockName, stockCode]);

  // 根据时间查找数据点
  const findDataPointByTime = (data: StockData[], timestamp: number): StockData | null => {
    const targetDate = new Date(timestamp * 1000).toISOString().split('T')[0];
    return data.find(item => item.date === targetDate) || null;
  };

  // 格式化日期显示
  const formatDateForDisplay = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    } catch {
      return dateStr;
    }
  };

  // 生成模拟数据（后备）
  const generateMockData = (): StockData[] => {
    const mockData: StockData[] = [];
    let basePE = 15;
    let basePB = 2;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (30 - i));
      
      const peTTM = basePE + (Math.random() - 0.5) * 5;
      const pbMRQ = basePB + (Math.random() - 0.5) * 1;
      
      mockData.push({
        code: stockCode,
        date: date.toISOString().split('T')[0],
        codeName: stockName,
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        preclose: 0,
        volume: 0,
        amount: 0,
        adjustflag: 1,
        turn: 0,
        tradestatus: 1,
        pctChg: 0,
        peTTM,
        pbMRQ,
        psTTM: 0,
        pcfNcfTTM: 0,
        isST: 0,
      });
    }
    
    return mockData;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">加载PE/PB数据中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 图表标题和时间范围选择器 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {stockName || stockCode} - PE/PB历史曲线
          </h2>
          <p className="text-sm text-gray-500">
            展示市盈率(PE)和市净率(PB)的历史变化
          </p>
        </div>
        
        <div className="flex space-x-2 mt-2 md:mt-0">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((range) => (
            <button
              key={range}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleTimeRangeChange(range)}
            >
              {range === '1M' ? '1个月' : 
               range === '3M' ? '3个月' : 
               range === '6M' ? '6个月' : 
               range === '1Y' ? '1年' : '全部'}
            </button>
          ))}
        </div>
      </div>

      {/* 图表容器 */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div ref={chartContainerRef} className="w-full h-[500px]" />
        
        {/* 十字线数据展示 */}
        {crosshairData && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-500">日期</div>
                <div className="text-lg font-semibold">{crosshairData.time}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">PE(TTM)</div>
                <div className={`text-lg font-semibold ${
                  crosshairData.peTTM > 20 ? 'text-red-600' : 
                  crosshairData.peTTM > 10 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {crosshairData.peTTM.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">PB(MRQ)</div>
                <div className={`text-lg font-semibold ${
                  crosshairData.pbMRQ > 3 ? 'text-red-600' : 
                  crosshairData.pbMRQ > 1.5 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {crosshairData.pbMRQ.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 图例说明 */}
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
            <span className="text-gray-700">PE(TTM) - 市盈率</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-green-500 mr-2"></div>
            <span className="text-gray-700">PB(MRQ) - 市净率</span>
          </div>
        </div>
      </div>

      {/* 说明文字 */}
      <div className="text-sm text-gray-500">
        <p>• PE(TTM)：滚动市盈率，反映公司市值与最近12个月净利润的比率</p>
        <p>• PB(MRQ)：市净率，反映公司市值与最近季度净资产的比率</p>
        <p>• 颜色说明：绿色表示估值较低，黄色表示估值适中，红色表示估值较高</p>
      </div>
    </div>
  );
};

export default PEPBChart;