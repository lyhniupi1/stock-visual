'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchEquityBondSpreadData, EquityBondSpreadData } from '@/lib/api';
import * as lwc from 'lightweight-charts';

const EquityBondSpreadChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const [spreadData, setSpreadData] = useState<EquityBondSpreadData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [crosshairData, setCrosshairData] = useState<{
    time: string;
    close: number;
    peSpread: number;
  } | null>(null);

  // 加载股债利差数据
  useEffect(() => {
    const loadSpreadData = async () => {
      try {
        setLoading(true);
        // 获取所有数据（limit=0表示获取所有）
        const data = await fetchEquityBondSpreadData(0);
        setSpreadData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load equity bond spread data:', err);
        setError('无法加载股债利差数据');
      } finally {
        setLoading(false);
      }
    };

    loadSpreadData();
  }, []);

  // 初始化组合图表
  useEffect(() => {
    if (!chartContainerRef.current || spreadData.length === 0) return;

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
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        leftPriceScale: {
          borderColor: '#d1d5db',
          visible: true,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
        },
        timeScale: {
          borderColor: '#d1d5db',
          timeVisible: true,
          secondsVisible: false,
        },
      });

      chartRef.current = chart;

      // 准备数据 - 需要按时间升序排列
      const sortedData = [...spreadData]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // 准备收盘价数据（使用左侧Y轴）
      const closeData = sortedData.map(item => ({
        time: (new Date(item.date).getTime() / 1000) as any,
        value: item.close || 0,
      }));

      // 准备股债利差数据（使用右侧Y轴，转换为百分比）
      const peSpreadData = sortedData.map(item => ({
        time: (new Date(item.date).getTime() / 1000) as any,
        value: (item.peSpread || 0) * 100, // 转换为百分比
      }));

      // 添加收盘价系列 - 使用线图，左侧Y轴
      const closeSeries = chart.addSeries(lwc.LineSeries, {
        color: '#3b82f6',
        lineWidth: 2,
        title: '沪深300收盘价',
        priceScaleId: 'left', // 使用左侧价格刻度
      });

      // 添加股债利差系列 - 使用线图，右侧Y轴
      const peSpreadSeries = chart.addSeries(lwc.LineSeries, {
        color: '#10b981',
        lineWidth: 2,
        title: '股债利差(%)',
        priceScaleId: 'right', // 使用右侧价格刻度
      });

      // 设置数据
      closeSeries.setData(closeData);
      peSpreadSeries.setData(peSpreadData);

      // 订阅十字线移动事件
      chart.subscribeCrosshairMove((param: any) => {
        if (param.time) {
          const timestamp = param.time;
          const dataPoint = findDataPointByTime(sortedData, timestamp);
          
          if (dataPoint) {
            setCrosshairData({
              time: formatDateForDisplay(dataPoint.date),
              close: dataPoint.close,
              peSpread: dataPoint.peSpread,
            });
          }
        } else {
          // 显示最新数据
          updateCrosshairWithLatestData(sortedData);
        }
      });

      // 设置初始十字线数据
      updateCrosshairWithLatestData(sortedData);

      // 处理窗口大小变化
      const handleResize = () => {
        if (chart && container) {
          chart.applyOptions({
            width: container.clientWidth,
          });
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    const updateCrosshairWithLatestData = (data: EquityBondSpreadData[]) => {
      if (data.length > 0) {
        const latestData = data[data.length - 1]; // 最新的数据在最后（因为已排序）
        setCrosshairData({
          time: formatDateForDisplay(latestData.date),
          close: latestData.close,
          peSpread: latestData.peSpread,
        });
      }
    };

    const cleanup = initChart();

    return () => {
      if (cleanup) cleanup();
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, [spreadData]);

  // 根据时间查找数据点
  const findDataPointByTime = (data: EquityBondSpreadData[], timestamp: number): EquityBondSpreadData | null => {
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

  // 计算统计数据
  const calculateStats = () => {
    if (spreadData.length === 0) return null;

    const peSpreadValues = spreadData.map(item => item.peSpread).filter(val => val !== null && !isNaN(val));
    const closeValues = spreadData.map(item => item.close).filter(val => val !== null && !isNaN(val));

    if (peSpreadValues.length === 0 || closeValues.length === 0) return null;

    const latestData = spreadData[0]; // 最新的数据在第一个（原始顺序）
    const latestPeSpread = latestData.peSpread;
    const latestClose = latestData.close;

    const avgPeSpread = peSpreadValues.reduce((sum, val) => sum + val, 0) / peSpreadValues.length;
    const maxPeSpread = Math.max(...peSpreadValues);
    const minPeSpread = Math.min(...peSpreadValues);

    const avgClose = closeValues.reduce((sum, val) => sum + val, 0) / closeValues.length;
    const maxClose = Math.max(...closeValues);
    const minClose = Math.min(...closeValues);

    // 计算历史分位
    const sortedPeSpreadValues = [...peSpreadValues].sort((a, b) => a - b);
    const percentile = (sortedPeSpreadValues.filter(v => v <= latestPeSpread).length / sortedPeSpreadValues.length) * 100;

    return {
      latestPeSpread,
      latestClose,
      avgPeSpread,
      maxPeSpread,
      minPeSpread,
      avgClose,
      maxClose,
      minClose,
      dataCount: spreadData.length,
      dateRange: spreadData.length > 0 ?
        `${formatDateForDisplay(spreadData[spreadData.length - 1].date)} 至 ${formatDateForDisplay(spreadData[0].date)}` :
        '无数据',
      percentile: Math.round(percentile * 10) / 10, // 保留一位小数
    };
  };

  const stats = calculateStats();

  // 计算策略建议
  const getStrategyRecommendation = () => {
    if (!stats) return null;
    
    const currentSpread = stats.latestPeSpread * 100; // 转换为百分比
    let recommendation = {
      level: '',
      description: '',
      suggestedPosition: '',
      action: '',
      color: '',
      thresholds: [] as {level: string, threshold: string, position: string}[],
    };

    // 定义阈值（仓位范围：20%-80%）
    const thresholds = [
      { level: '极度低估', threshold: '>6.5%', position: '70-80%', color: 'bg-green-100 border-green-300' },
      { level: '显著低估', threshold: '5.5%-6.5%', position: '50-70%', color: 'bg-blue-100 border-blue-300' },
      { level: '适度低估', threshold: '4.5%-5.5%', position: '30-50%', color: 'bg-yellow-100 border-yellow-300' },
      { level: '合理估值', threshold: '3.5%-4.5%', position: '20-30%', color: 'bg-gray-100 border-gray-300' },
      { level: '适度高估', threshold: '2.5%-3.5%', position: '20-30%', color: 'bg-orange-100 border-orange-300' },
      { level: '显著高估', threshold: '<2.5%', position: '20%以下', color: 'bg-red-100 border-red-300' },
    ];

    // 确定当前水平
    if (currentSpread > 6.5) {
      recommendation = {
        level: '极度低估',
        description: '股票市场极度低估，投资价值极高',
        suggestedPosition: '70-80%',
        action: '重仓入场，分批建仓',
        color: 'bg-green-100 border-green-300',
        thresholds,
      };
    } else if (currentSpread >= 5.5) {
      recommendation = {
        level: '显著低估',
        description: '股票市场显著低估，投资价值较高',
        suggestedPosition: '50-70%',
        action: '中度入场，分批建仓',
        color: 'bg-blue-100 border-blue-300',
        thresholds,
      };
    } else if (currentSpread >= 4.5) {
      recommendation = {
        level: '适度低估',
        description: '股票市场适度低估，有一定投资价值',
        suggestedPosition: '30-50%',
        action: '轻仓入场，谨慎建仓',
        color: 'bg-yellow-100 border-yellow-300',
        thresholds,
      };
    } else if (currentSpread >= 3.5) {
      recommendation = {
        level: '合理估值',
        description: '市场估值处于合理水平',
        suggestedPosition: '20-30%',
        action: '保持现有仓位，等待机会',
        color: 'bg-gray-100 border-gray-300',
        thresholds,
      };
    } else if (currentSpread >= 2.5) {
      recommendation = {
        level: '适度高估',
        description: '股票市场适度高估，投资价值较低',
        suggestedPosition: '20-30%',
        action: '考虑减仓，锁定利润',
        color: 'bg-orange-100 border-orange-300',
        thresholds,
      };
    } else {
      recommendation = {
        level: '显著高估',
        description: '股票市场显著高估，投资风险较高',
        suggestedPosition: '20%以下',
        action: '大幅减仓，防范风险',
        color: 'bg-red-100 border-red-300',
        thresholds,
      };
    }

    return recommendation;
  };

  const strategy = getStrategyRecommendation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">加载股债利差数据中...</div>
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

  if (spreadData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">暂无股债利差数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          股债利差分析
        </h2>
        <p className="text-gray-600 mt-1">
          数据来源: magicFormulaData.db 的 equity_bond_spread 表 | 指数: 沪深300 (000300.SH)
        </p>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">最新股债利差</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {(stats.latestPeSpread * 100).toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              均值: {(stats.avgPeSpread * 100).toFixed(2)}%
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">最新收盘价</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {stats.latestClose.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              均值: {stats.avgClose.toFixed(2)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">当前股债利差的历史分位</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {stats.percentile}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              高于{stats.percentile}%的历史数据
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">数据范围</div>
            <div className="text-lg font-bold text-purple-600 mt-1">
              {stats.dataCount} 个交易日
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.dateRange}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">股债利差范围</div>
            <div className="text-lg font-bold text-yellow-600 mt-1">
              {(stats.minPeSpread * 100).toFixed(2)}% - {(stats.maxPeSpread * 100).toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              当前: {(stats.latestPeSpread * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* 策略建议卡片 */}
      {strategy && (
        <div className={`rounded-xl p-5 border-2 ${strategy.color}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">投资策略建议</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  strategy.level.includes('低估') ? 'bg-green-100 text-green-800' :
                  strategy.level.includes('高估') ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {strategy.level}
                </span>
              </div>
              <p className="text-gray-700 mb-3">{strategy.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-sm text-gray-500">建议仓位</div>
                  <div className="text-lg font-bold text-blue-600">{strategy.suggestedPosition}</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="text-sm text-gray-500">操作建议</div>
                  <div className="text-lg font-bold text-green-600">{strategy.action}</div>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/3">
              <div className="bg-white rounded-lg p-4 border border-gray-300">
                <h4 className="font-bold text-gray-800 mb-3">股债利差策略阈值</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {strategy.thresholds.map((item, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded text-sm ${
                        strategy.level === item.level ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.level}</span>
                        <span className="text-gray-600">{item.threshold}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">建议仓位: {item.position}</div>
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-200">
                  基于2005-2026年历史数据分析
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-300">
            <div className="text-sm text-gray-700">
              <p className="mb-1"><span className="font-medium">当前股债利差</span>: {(stats!.latestPeSpread * 100).toFixed(2)}% | <span className="font-medium">历史分位</span>: {stats!.percentile}%</p>
              <p className="text-gray-600">策略说明：股债利差越高，股票相对债券越有吸引力。建议在低估区域分批入场，高估区域分批出场。</p>
            </div>
          </div>
        </div>
      )}

      {/* 组合图表 */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              沪深300收盘价与股债利差趋势
            </h3>
            <p className="text-sm text-gray-500">
              左侧Y轴：沪深300收盘价 | 右侧Y轴：股债利差(%)
            </p>
          </div>
          {crosshairData && (
            <div className="text-sm text-gray-600 space-y-1">
              <div>日期: {crosshairData.time}</div>
              <div className="font-medium text-blue-600">
                收盘价: {crosshairData.close.toFixed(2)}
              </div>
              <div className="font-medium text-green-600">
                股债利差: {(crosshairData.peSpread * 100).toFixed(2)}%
              </div>
            </div>
          )}
        </div>
        <div ref={chartContainerRef} className="w-full h-[500px]" />
        
        {/* 图例说明 */}
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
            <span className="text-gray-700">沪深300收盘价</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-green-500 mr-2"></div>
            <span className="text-gray-700">股债利差(%)</span>
          </div>
        </div>
      </div>

      {/* 数据说明 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          <p className="mb-2">
            <span className="font-medium">股债利差(PE Spread)</span>：也称为股权风险溢价(ERP)，计算公式为：1/市盈率(PE) - 10年期国债收益率。反映股票市场相对于债券市场的估值吸引力。
          </p>
          <p className="mb-2">
            <span className="font-medium">解读</span>：股债利差越高，说明股票市场相对于债券市场越有吸引力；反之则债券市场更有吸引力。
          </p>
          <p>
            <span className="font-medium">数据说明</span>：数据来源于 magicFormulaData.db 的 equity_bond_spread 表，包含沪深300指数的收盘价和股债利差数据。
          </p>
        </div>
      </div>
    </div>
  );
};

export default EquityBondSpreadChart;