'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchStockHistory, StockData } from '@/lib/api';

interface StockChartProps {
  stockCode: string;
  stockName?: string;
  limit?: number;
}

const StockChart = ({ stockCode, stockName = '', limit = 0 }: StockChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crosshairData, setCrosshairData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    change: number;
    changePercent: number;
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
  useEffect(() => {
    const loadDataForRange = async () => {
      let newLimit = 365;
      switch (timeRange) {
        case '1M': newLimit = 30; break;
        case '3M': newLimit = 90; break;
        case '6M': newLimit = 180; break;
        case '1Y': newLimit = 365; break;
        case 'ALL': newLimit = 0; break;
      }
      
      try {
        const data = await fetchStockHistory(stockCode, newLimit);
        setStockData(data);
      } catch (err) {
        console.error('Failed to load stock data for range:', err);
      }
    };

    loadDataForRange();
  }, [timeRange, stockCode]);

  // 初始化图表
  useEffect(() => {
    if (!chartContainerRef.current || stockData.length === 0) return;

    const initChart = async () => {
      // 动态导入lightweight-charts
      const lwc = await import('lightweight-charts');
      const { createChart } = lwc;
      
      // 清除现有图表
      if (chartRef.current) {
        try {
          chartRef.current.remove();
        } catch (err) {
          // 图表可能已经被销毁，忽略错误
          console.log('Chart already disposed');
        }
        chartRef.current = null;
      }

      const container = chartContainerRef.current;
      if (!container) return;

      const chart = createChart(container, {
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

      // 准备K线数据
      const candlestickData = stockData.map(item => ({
        time: (new Date(item.date).getTime() / 1000) as any,
        open: item.open || 0,
        high: item.high || 0,
        low: item.low || 0,
        close: item.close || 0,
      }));

      // 准备成交量数据
      const volumeData = stockData.map(item => ({
        time: (new Date(item.date).getTime() / 1000) as any,
        value: item.volume || 0,
        color: (item.close || 0) >= (item.open || 0) ? '#10b981' : '#ef4444',
      }));

      // 添加K线系列 - 使用正确的API
      const candlestickSeries = chart.addSeries(lwc.CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });

      // 添加成交量系列 - 使用正确的API
      const volumeSeries = chart.addSeries(lwc.HistogramSeries, {
        color: '#9ca3af',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });

      // 设置数据
      candlestickSeries.setData(candlestickData);
      volumeSeries.setData(volumeData);

      // 调整主价格图（K线图）的位置，为成交量留出更多空间
      chart.priceScale('right').applyOptions({
        scaleMargins: {
          top: 0.1,
          bottom: 0.4,
        },
      });

      // 调整成交量图的位置，增大与K线图的间隔
      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.65,
          bottom: 0.05,
        },
      });

      // 订阅十字线移动事件
      chart.subscribeCrosshairMove((param: any) => {
        if (param.time) {
          const timestamp = param.time;
          const dataPoint = findDataPointByTime(stockData, timestamp);
          
          if (dataPoint) {
            const change = dataPoint.close - dataPoint.open;
            const changePercent = (change / dataPoint.open) * 100;
            
            setCrosshairData({
              time: formatDateForDisplay(dataPoint.date),
              open: dataPoint.open,
              high: dataPoint.high,
              low: dataPoint.low,
              close: dataPoint.close,
              volume: dataPoint.volume,
              change,
              changePercent,
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
        const change = latestData.close - latestData.open;
        const changePercent = (change / latestData.open) * 100;
        
        setCrosshairData({
          time: formatDateForDisplay(latestData.date),
          open: latestData.open,
          high: latestData.high,
          low: latestData.low,
          close: latestData.close,
          volume: latestData.volume,
          change,
          changePercent,
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
  }, [stockData]);

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
    let basePrice = 100;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (30 - i));
      
      const open = basePrice + (Math.random() - 0.5) * 10;
      const close = open + (Math.random() - 0.5) * 8;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      
      mockData.push({
        code: stockCode,
        date: date.toISOString().split('T')[0],
        codeName: stockName,
        open,
        high,
        low,
        close,
        preclose: basePrice,
        volume: Math.floor(Math.random() * 1000000),
        amount: Math.floor(Math.random() * 10000000),
        adjustflag: 1,
        turn: Math.random() * 5,
        tradestatus: 1,
        pctChg: ((close - open) / open) * 100,
        peTTM: Math.random() * 30,
        pbMRQ: Math.random() * 5,
        psTTM: Math.random() * 10,
        pcfNcfTTM: Math.random() * 20,
        isST: 0,
      });
      
      basePrice = close;
    }
    
    return mockData;
  };

  // 处理时间范围按钮点击
  const handleTimeRangeChange = (range: '1M' | '3M' | '6M' | '1Y' | 'ALL') => {
    setTimeRange(range);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">正在加载股票K线数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-red-800">数据加载失败</h3>
          <p className="text-red-700">{error}</p>
          <p className="text-red-700 mt-2">显示模拟数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* 图表标题和时间范围选择器 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {stockName || stockCode} K线图
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            数据来源：本地数据库，共 {stockData.length} 个交易日数据
          </p>
        </div>
        
        {/* 时间范围选择器 */}
        <div className="flex space-x-2 mt-2 md:mt-0">
          {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '1M' ? '1个月' : 
               range === '3M' ? '3个月' : 
               range === '6M' ? '6个月' : 
               range === '1Y' ? '1年' : '全部'}
            </button>
          ))}
        </div>
      </div>

      {/* 十字线数据展示 */}
      {crosshairData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">日期</p>
              <p className="font-semibold">{crosshairData.time}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">开盘</p>
              <p className="font-semibold">{crosshairData.open.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">最高</p>
              <p className="font-semibold">{crosshairData.high.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">最低</p>
              <p className="font-semibold">{crosshairData.low.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">收盘</p>
              <p className="font-semibold">{crosshairData.close.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">涨跌</p>
              <p className={`font-semibold ${crosshairData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {crosshairData.change >= 0 ? '+' : ''}{crosshairData.change.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">涨跌幅</p>
              <p className={`font-semibold ${crosshairData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {crosshairData.changePercent >= 0 ? '+' : ''}{crosshairData.changePercent.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">成交量</p>
              <p className="font-semibold">
                {(crosshairData.volume / 10000).toFixed(1)}万手
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            提示：在图表上移动鼠标查看详细数据，拖动图表可调整时间范围
          </p>
        </div>
      )}

      {/* 图表容器 */}
      <div ref={chartContainerRef} className="w-full border border-gray-200 rounded-lg overflow-hidden" />
      
      {/* 图例和说明 */}
      <div className="mt-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 mr-2"></div>
            <span className="text-sm text-gray-600">上涨</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 mr-2"></div>
            <span className="text-sm text-gray-600">下跌</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-400 mr-2"></div>
            <span className="text-sm text-gray-600">成交量</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-500 mt-2 md:mt-0">
          <p>绿色表示上涨（收盘价≥开盘价），红色表示下跌（收盘价＜开盘价）</p>
          <p className="mt-1">支持鼠标悬停查看详细数据，拖动图表调整时间范围</p>
        </div>
      </div>
    </div>
  );
};

export default StockChart;