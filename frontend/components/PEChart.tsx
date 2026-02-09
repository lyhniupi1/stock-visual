'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchStockHistory, StockData } from '@/lib/api';
import * as lwc from 'lightweight-charts';

interface PEChartProps {
  stockCode: string;
  stockName?: string;
  limit?: number;
}

const PEChart = ({ stockCode, stockName = '', limit = 0 }: PEChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crosshairData, setCrosshairData] = useState<{
    time: string;
    peTTM: number;
  } | null>(null);
  const [timeRange, setTimeRange] = useState<'1Y' | '3Y' | '5Y' | '10Y' | 'ALL'>('1Y');
  const [internalLimit, setInternalLimit] = useState<number>(limit);
  const [percentile, setPercentile] = useState<number | null>(null);

  // 根据时间范围计算 limit
  const getLimitFromTimeRange = (range: '1Y' | '3Y' | '5Y' | '10Y' | 'ALL'): number => {
    switch (range) {
      case '1Y':
        return 1*365;
      case '3Y':
        return 3*365;
      case '5Y':
        return 5*365;
      case '10Y':
        return 10*365;
      case 'ALL':
        return 0; // 0 表示获取所有数据
      default:
        return 0;
    }
  };

  // 计算百分位
  const calculatePercentile = (values: number[], currentValue: number): number => {
    if (values.length === 0) return 0;
    
    // 过滤掉无效值
    const validValues = values.filter(v => !isNaN(v) && isFinite(v));
    if (validValues.length === 0) return 0;
    
    // 排序
    const sortedValues = [...validValues].sort((a, b) => a - b);
    
    // 计算小于等于当前值的数量
    const countLessOrEqual = sortedValues.filter(v => v <= currentValue).length;
    
    // 计算百分位
    const percentile = (countLessOrEqual / sortedValues.length) * 100;
    
    return Math.round(percentile * 10) / 10; // 保留一位小数
  };

  // 当 prop limit 变化时，更新 internalLimit
  useEffect(() => {
    setInternalLimit(limit);
  }, [limit]);

  useEffect(() => {
    const loadStockData = async () => {
      try {
        setLoading(true);
        const data = await fetchStockHistory(stockCode, internalLimit);
        setStockData(data);
        
        // 计算最新数据的百分位
        if (data.length > 0) {
          const latestData = data[data.length - 1];
          const peValues = data.map(item => item.peTTM).filter(pe => pe && pe > 0);
          if (peValues.length > 0 && latestData.peTTM) {
            const percentileValue = calculatePercentile(peValues, latestData.peTTM);
            setPercentile(percentileValue);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Failed to load stock data:', err);
        setError('无法加载股票历史数据');
        // 使用模拟数据作为后备
        const mockData = generateMockData();
        setStockData(mockData);
        
        // 为模拟数据计算百分位
        if (mockData.length > 0) {
          const latestData = mockData[mockData.length - 1];
          const peValues = mockData.map(item => item.peTTM).filter(pe => pe && pe > 0);
          if (peValues.length > 0 && latestData.peTTM) {
            const percentileValue = calculatePercentile(peValues, latestData.peTTM);
            setPercentile(percentileValue);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadStockData();
  }, [stockCode, internalLimit]);

  // 处理时间范围变化
  const handleTimeRangeChange = (range: '1Y' | '3Y' | '5Y' | '10Y' | 'ALL') => {
    setTimeRange(range);
    const newLimit = getLimitFromTimeRange(range);
    setInternalLimit(newLimit);
    // limit 变化会触发 useEffect 重新获取数据
  };

  useEffect(() => {
    if (!chartContainerRef.current || stockData.length === 0) return;

    const container = chartContainerRef.current;
    if (!container) return;


    const initChart = () => {
      // 创建图表实例
      const chart = lwc.createChart(container, {
        width: container.clientWidth,
        height: 400,
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

      // 添加PE系列 - 使用线图
      const peSeries = chart.addSeries(lwc.LineSeries, {
        color: '#3b82f6',
        lineWidth: 2,
        title: 'PE(TTM)',
      });

      // 设置数据
      peSeries.setData(peData);

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
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (30 - i));
      
      const peTTM = basePE + (Math.random() - 0.5) * 5;
      
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
        pbMRQ: 0,
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
        <div className="text-gray-500">加载PE数据中...</div>
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
          <h3 className="text-lg font-bold text-gray-900">
            PE(TTM)历史曲线
          </h3>
          <p className="text-sm text-gray-500">
            展示市盈率(PE)的历史变化
          </p>
        </div>
        
        <div className="flex space-x-2 mt-2 md:mt-0">
          {(['1Y', '3Y', '5Y', '10Y', 'ALL'] as const).map((range) => (
            <button
              key={range}
              className={`px-3 py-1 text-sm rounded-md ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => handleTimeRangeChange(range)}
            >
              {range === '1Y' ? '1年' : 
               range === '3Y' ? '3年' : 
               range === '5Y' ? '5年' : 
               range === '10Y' ? '10年' : '全部'}
            </button>
          ))}
        </div>
      </div>

      {/* 图表容器 */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div ref={chartContainerRef} className="w-full h-[400px]" />
        
        {/* 十字线数据展示 */}
        {crosshairData && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
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
                <div className="text-sm text-gray-500">历史分位</div>
                <div className="text-lg font-semibold text-blue-700">
                  {percentile !== null ? `${percentile}%` : '计算中...'}
                </div>
                <div className="text-xs text-gray-500">
                  {percentile !== null && percentile >= 0 && percentile <= 100 ? (
                    percentile < 30 ? '处于历史较低水平' :
                    percentile < 70 ? '处于历史中等水平' :
                    '处于历史较高水平'
                  ) : ''}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 图例说明 */}
        <div className="mt-4 flex items-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
            <span className="text-gray-700">PE(TTM) - 滚动市盈率</span>
          </div>
        </div>
      </div>

      {/* 说明文字 */}
      <div className="text-sm text-gray-500">
        <p>• PE(TTM)：滚动市盈率，反映公司市值与最近12个月净利润的比率</p>
        <p>• 估值参考：PE {'<'} 10（低估），10-20（合理），{'>'} 20（高估）</p>
        <p>• 适用行业：盈利稳定的成熟行业（如消费、金融）</p>
      </div>
    </div>
  );
};

export default PEChart;