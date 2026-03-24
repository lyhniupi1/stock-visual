'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchDividendRatioHistory, DividendRatioData } from '@/lib/api';
import * as lwc from 'lightweight-charts';

interface DividendRatioChartProps {
  stockCode: string;
  stockName?: string;
}

const DividendRatioChart = ({ stockCode, stockName = '' }: DividendRatioChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [dividendData, setDividendData] = useState<DividendRatioData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crosshairData, setCrosshairData] = useState<{
    time: string;
    dividendPayRatio: number;
  } | null>(null);

  // 加载股息支付率数据
  useEffect(() => {
    const loadDividendData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDividendRatioHistory(stockCode);
        setDividendData(data);
      } catch (err) {
        console.error('Failed to load dividend ratio data:', err);
        setError('无法加载股息支付率数据');
      } finally {
        setLoading(false);
      }
    };

    if (stockCode) {
      loadDividendData();
    }
  }, [stockCode]);

  // 初始化图表
  useEffect(() => {
    if (!chartContainerRef.current || dividendData.length === 0) return;

    // 根据时间查找数据点
    const findDataPointByTime = (data: DividendRatioData[], timestamp: any): DividendRatioData | null => {
      try {
        // timestamp可能是字符串格式（如"2024-12-31"）或数字时间戳
        let targetDate: string;
        
        if (typeof timestamp === 'string') {
          // 如果是字符串，直接使用
          targetDate = timestamp;
        } else if (typeof timestamp === 'number') {
          // 如果是数字，转换为日期字符串
          targetDate = new Date(timestamp * 1000).toISOString().split('T')[0];
        } else {
          return null;
        }
        
        return data.find(item => {
          const itemDate = item.date.split(' ')[0];
          return itemDate === targetDate;
        }) || null;
      } catch (error) {
        console.error('Error in findDataPointByTime:', error);
        return null;
      }
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

    // 清理之前的图表
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    // 创建图表
    const chart = lwc.createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
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

    // 创建股息支付率柱状图系列
    const barSeries = chart.addSeries(lwc.HistogramSeries, {
      color: '#10b981',
      title: '股息支付率(%)',
      priceScaleId: 'right',
      priceFormat: {
        type: 'percent',
        precision: 2,
      },
      // 设置柱状图基础线
      base: 0,
    });

    // 准备图表数据
    const chartData = dividendData
      .filter(item => item.dividendPayRatio !== null && item.dividendPayRatio !== undefined)
      .map(item => ({
        time: item.date.split(' ')[0], // 去掉时间部分，只保留日期
        value: item.dividendPayRatio!,
        color: item.dividendPayRatio! > 50 ? '#ef4444' :
               item.dividendPayRatio! > 30 ? '#f59e0b' :
               item.dividendPayRatio! > 20 ? '#3b82f6' : '#10b981',
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    // 设置数据
    barSeries.setData(chartData);

    // 设置时间刻度的柱状图宽度
    chart.timeScale().applyOptions({
      barSpacing: 20, // 柱状图之间的间距
      minBarSpacing: 10, // 最小间距
      rightOffset: 10, // 右侧偏移
    });

    // 添加十字光标事件
    const updateCrosshairWithLatestData = () => {
      const latestData = dividendData[0]; // 最新的数据在第一个
      if (latestData && latestData.dividendPayRatio !== null) {
        setCrosshairData({
          time: formatDateForDisplay(latestData.date),
          dividendPayRatio: latestData.dividendPayRatio,
        });
      }
    };

    chart.subscribeCrosshairMove((param: any) => {
      if (param.time) {
        const timestamp = param.time;
        const dataPoint = findDataPointByTime(dividendData, timestamp);
        
        if (dataPoint && dataPoint.dividendPayRatio !== null) {
          setCrosshairData({
            time: formatDateForDisplay(dataPoint.date),
            dividendPayRatio: dataPoint.dividendPayRatio,
          });
        }
      } else {
        // 显示最新数据
        updateCrosshairWithLatestData();
      }
    });
    
    updateCrosshairWithLatestData();

    // 响应窗口大小变化
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    chartRef.current = chart;

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [dividendData]);

  // 计算统计数据
  const calculateStats = () => {
    if (dividendData.length === 0) return null;

    const validRatios = dividendData
      .map(item => item.dividendPayRatio)
      .filter(ratio => ratio !== null && ratio !== undefined) as number[];

    if (validRatios.length === 0) return null;

    const currentRatio = validRatios[0]; // 最新的数据
    const avgRatio = validRatios.reduce((sum, ratio) => sum + ratio, 0) / validRatios.length;
    const maxRatio = Math.max(...validRatios);
    const minRatio = Math.min(...validRatios);

    return {
      current: currentRatio,
      average: avgRatio,
      max: maxRatio,
      min: minRatio,
      count: validRatios.length,
    };
  };

  const stats = calculateStats();

  // 格式化百分比显示
  const formatPercent = (value: number | null) => {
    if (value === null || value === undefined) return '-';
    return `${value.toFixed(2)}%`;
  };

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">加载股息支付率数据中...</div>
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

  if (dividendData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">暂无股息支付率数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题和统计信息 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {stockName || stockCode} - 股息支付率历史曲线
          </h2>
          <p className="text-gray-600 mt-1">
            股票代码: {stockCode} | 数据来源: eastmoney_dividend_ratio表
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">当前股息支付率</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {formatPercent(stats.current)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">历史平均</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {formatPercent(stats.average)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">历史最高</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {formatPercent(stats.max)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">历史最低</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1">
              {formatPercent(stats.min)}
            </div>
          </div>
        </div>
      )}

      {/* 图表容器 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div ref={chartContainerRef} className="w-full h-[500px]" />
        
        {/* 十字光标信息 */}
        {crosshairData && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">日期:</span>
              <span className="font-medium">{formatDate(crosshairData.time)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-600">股息支付率:</span>
              <span className="font-medium text-green-600">
                {formatPercent(crosshairData.dividendPayRatio)}
              </span>
            </div>
          </div>
        )}

        {/* 数据说明 */}
        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2">
            <span className="font-medium">股息支付率</span>：指公司实际支付的现金股利占归属于母公司净利润的比例，反映公司分红政策的稳定性。
          </p>
          <p>
            <span className="font-medium">数据说明</span>：数据来源于东方财富eastmoney_dividend_ratio表，DIVIDEND_PAY_IMPLE字段。
          </p>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">股息支付率历史数据</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  报告期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  股息支付率
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  实际分红(亿元)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  归母净利润(亿元)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dividendData.slice(0, 10).map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(item.date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${
                      item.dividendPayRatio && item.dividendPayRatio > 30 
                        ? 'text-green-600' 
                        : item.dividendPayRatio && item.dividendPayRatio > 20 
                        ? 'text-blue-600' 
                        : 'text-gray-600'
                    }`}>
                      {formatPercent(item.dividendPayRatio)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.dividendImple !== null ? `${item.dividendImple.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.parentNetProfit !== null ? `${item.parentNetProfit.toFixed(2)}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {dividendData.length > 10 && (
          <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-500">
            显示最近10条记录，共{dividendData.length}条记录
          </div>
        )}
      </div>
    </div>
  );
};

export default DividendRatioChart;