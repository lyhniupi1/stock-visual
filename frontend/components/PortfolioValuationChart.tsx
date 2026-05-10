'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Link from 'next/link';
import { fetchPortfolioBacktestStatInfo, fetchStockCodes, PortfolioBacktestStatInfo } from '@/lib/api';
import * as lwc from 'lightweight-charts';

interface ChartConfig {
  title: string;
  dataKey: keyof Pick<PortfolioBacktestStatInfo, 'median_pe' | 'median_pb' | 'median_pe_pb' | 'median_dividend_yield' | 'median_roe'>;
  color: string;
  valueFormatter: (value: number) => string;
  unit: string;
}

const chartConfigs: ChartConfig[] = [
  {
    title: 'PE中位数',
    dataKey: 'median_pe',
    color: '#3b82f6',
    valueFormatter: (v) => v.toFixed(2),
    unit: '倍',
  },
  {
    title: 'PB中位数',
    dataKey: 'median_pb',
    color: '#10b981',
    valueFormatter: (v) => v.toFixed(2),
    unit: '倍',
  },
  {
    title: 'PE×PB中位数',
    dataKey: 'median_pe_pb',
    color: '#f59e0b',
    valueFormatter: (v) => v.toFixed(2),
    unit: '',
  },
  {
    title: '分红率',
    dataKey: 'median_dividend_yield',
    color: '#ef4444',
    valueFormatter: (v) => v.toFixed(4),
    unit: '',
  },
  {
    title: 'ROE中位数',
    dataKey: 'median_roe',
    color: '#8b5cf6',
    valueFormatter: (v) => v.toFixed(4),
    unit: '',
  },
];

/** 计算当前值在历史数据中的分位（百分比） */
function calcPercentile(values: number[], currentValue: number): number {
  if (values.length === 0) return 50;
  const countLess = values.filter(v => v < currentValue).length;
  return Math.round((countLess / values.length) * 100);
}

/** 获取原始数值 */
function getRawValue(item: PortfolioBacktestStatInfo, config: ChartConfig): number {
  return item[config.dataKey] as number;
}

/** 获取显示数值（直接用原始数据） */
function getDisplayValue(item: PortfolioBacktestStatInfo, config: ChartConfig): number {
  return getRawValue(item, config);
}

/** 详情弹窗组件 */
const DetailModal = ({ item, onClose, stockNameMap }: { item: PortfolioBacktestStatInfo; onClose: () => void; stockNameMap: Record<string, string> }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    onClick={onClose}
  >
    <div
      className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">
          持仓详情 - {item.date}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
        >
          ✕
        </button>
      </div>
      <div className="p-4 space-y-4">
        {/* 调仓信息 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-1.5">调仓信息</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {item.adjust_action || '无调仓操作'}
            </p>
          </div>
        </div>
        {/* 持仓股票 */}
        <div>
          <h4 className="text-sm font-semibold text-gray-500 mb-1.5">持仓股票</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            {item.stock_codes ? (
              <div className="flex flex-wrap gap-1.5">
                {item.stock_codes.split(',').map((code) => {
                  const trimmed = code.trim();
                  const name = stockNameMap[trimmed] || trimmed;
                  return (
                    <Link
                      key={trimmed}
                      href={`/stocks/${trimmed}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                    >
                      {name}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500">无持仓数据</p>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SingleChart = ({ data, config, stockNameMap }: { data: PortfolioBacktestStatInfo[]; config: ChartConfig; stockNameMap: Record<string, string> }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [detailItem, setDetailItem] = useState<PortfolioBacktestStatInfo | null>(null);

  // 构建 date -> PortfolioBacktestStatInfo 的映射，用于点击图表时查找详情
  const dataMap = useMemo(() => {
    const map = new Map<string, PortfolioBacktestStatInfo>();
    data.forEach(item => {
      map.set(item.date, item);
    });
    return map;
  }, [data]);

  // 计算统计数据
  const stats = useMemo(() => {
    const sorted = [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter((item, index, arr) => index === 0 || item.date !== arr[index - 1].date);

    if (sorted.length === 0) return null;

    const rawValues = sorted.map(item => getRawValue(item, config));
    const latest = sorted[sorted.length - 1];
    const latestRaw = getRawValue(latest, config);
    const latestDisplay = getDisplayValue(latest, config);

    const minRaw = Math.min(...rawValues);
    const maxRaw = Math.max(...rawValues);

    const percentile = calcPercentile(rawValues, latestRaw);

    return {
      latestDisplay,
      minDisplay: minRaw,
      maxDisplay: maxRaw,
      percentile,
      count: sorted.length,
    };
  }, [data, config]);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    const container = chartContainerRef.current;
    if (!container) return;

    const chart = lwc.createChart(container, {
      width: container.clientWidth,
      height: 350,
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
      timeScale: {
        borderColor: '#d1d5db',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // 按日期排序并去重
    const sortedData = [...data]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter((item, index, arr) => index === 0 || item.date !== arr[index - 1].date);

    const chartData = sortedData.map(item => ({
      time: (new Date(item.date).getTime() / 1000) as any,
      value: getDisplayValue(item, config),
    }));

    const series = chart.addSeries(lwc.LineSeries, {
      color: config.color,
      lineWidth: 2,
      title: config.title,
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    series.setData(chartData);

    // 添加 10/30/50/70/90 分位线
    const sortedValues = chartData.map(d => d.value as number).sort((a, b) => a - b);
    if (sortedValues.length > 0) {
      const percentileConfigs = [
        { p: 10, label: 'P10', style: lwc.LineStyle.Dashed, width: 1 as const, color: '#46dd46' },
        { p: 30, label: 'P30', style: lwc.LineStyle.Dashed, width: 1 as const, color: '#3669c0' },
        { p: 50, label: 'P50', style: lwc.LineStyle.Solid, width: 2 as const, color: '#9637b3' },
        { p: 70, label: 'P70', style: lwc.LineStyle.Dashed, width: 1 as const, color: '#a3216d' },
        { p: 90, label: 'P90', style: lwc.LineStyle.Dashed, width: 1 as const, color: '#c51852' },
      ];
      percentileConfigs.forEach(({ p, label, style, width, color }) => {
        const idx = Math.floor((sortedValues.length - 1) * p / 100);
        const price = sortedValues[idx];
        series.createPriceLine({
          price,
          color,
          lineWidth: width,
          lineStyle: style,
          axisLabelVisible: true,
          title: `${label} `,
        });
      });
    }

    // 添加工具提示（只显示数值，不包含按钮）
    const toolTip = document.createElement('div');
    toolTip.style.cssText = `
      position: absolute;
      display: none;
      padding: 8px 12px;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      font-size: 13px;
      pointer-events: none;
      z-index: 100;
    `;
    container.appendChild(toolTip);

    chart.subscribeCrosshairMove((param: any) => {
      if (!param.point || !param.time || param.seriesData.size === 0) {
        toolTip.style.display = 'none';
        return;
      }

      const dataPoint = param.seriesData.get(series);
      if (!dataPoint) {
        toolTip.style.display = 'none';
        return;
      }

      const dateStr = typeof param.time === 'string'
        ? param.time
        : new Date((param.time as number) * 1000).toISOString().split('T')[0];

      const value = dataPoint.value !== undefined ? dataPoint.value : dataPoint.close;
      const formattedValue = (value as number).toFixed(2) + config.unit;

      toolTip.style.display = 'block';
      toolTip.style.left = (param.point.x + 15) + 'px';
      toolTip.style.top = (param.point.y - 1) + 'px';
      toolTip.innerHTML = `<div style="font-weight:600;color:#374151;margin-bottom:2px">${dateStr}</div><div style="color:${config.color}">${config.title}: ${formattedValue}</div>`;
    });

    // 点击图表时，根据鼠标位置找到对应的数据点，打开详情弹窗
    const handleChartClick = (param: any) => {
      if (!param.time || !param.seriesData || param.seriesData.size === 0) return;

      const dataPoint = param.seriesData.get(series);
      if (!dataPoint) return;

      const dateStr = typeof param.time === 'string'
        ? param.time
        : new Date((param.time as number) * 1000).toISOString().split('T')[0];

      const fullItem = dataMap.get(dateStr);
      if (fullItem) {
        setDetailItem(fullItem);
      }
    };
    chart.subscribeClick(handleChartClick);

    // 窗口大小变化时自适应
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, config, dataMap]);

  // 判断分位高低
  const percentileLevel = stats
    ? stats.percentile <= 25 ? '低' : stats.percentile >= 75 ? '高' : '中'
    : '-';

  const percentileColor = stats
    ? stats.percentile <= 25 ? '#10b981' : stats.percentile >= 75 ? '#ef4444' : '#f59e0b'
    : '#6b7280';

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h3 className="text-lg font-bold mb-4" style={{ color: config.color }}>
        {config.title}
      </h3>

      {/* 统计信息卡片 */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">当前值</div>
            <div className="text-lg font-bold" style={{ color: config.color }}>
              {config.valueFormatter(stats.latestDisplay)}{config.unit}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">历史最小值</div>
            <div className="text-lg font-bold text-gray-700">
              {config.valueFormatter(stats.minDisplay)}{config.unit}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">历史最大值</div>
            <div className="text-lg font-bold text-gray-700">
              {config.valueFormatter(stats.maxDisplay)}{config.unit}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">历史分位</div>
            <div className="text-lg font-bold" style={{ color: percentileColor }}>
              {stats.percentile}%
              <span className="text-sm ml-1">({percentileLevel})</span>
            </div>
          </div>
        </div>
      )}

      <div ref={chartContainerRef} className="w-full" style={{ position: 'relative' }} />

      {/* 详情弹窗 */}
      {detailItem && (
        <DetailModal item={detailItem} onClose={() => setDetailItem(null)} stockNameMap={stockNameMap} />
      )}
    </div>
  );
};

const RANGE_OPTIONS = [
  { label: '全部', years: 0 },
  { label: '1年', years: 1 },
  { label: '3年', years: 3 },
  { label: '5年', years: 5 },
  { label: '10年', years: 10 },
  { label: '15年', years: 15 },
  { label: '20年', years: 20 },
] as const;

/** 根据年份范围过滤数据 */
function filterDataByYears(data: PortfolioBacktestStatInfo[], years: number): PortfolioBacktestStatInfo[] {
  if (years <= 0) return data;
  const now = new Date();
  const cutoff = new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
  return data.filter(item => new Date(item.date) >= cutoff);
}

const PortfolioValuationChart = () => {
  const [data, setData] = useState<PortfolioBacktestStatInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYears, setSelectedYears] = useState(10);
  const [stockNameMap, setStockNameMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [result, stockCodes] = await Promise.all([
          fetchPortfolioBacktestStatInfo(),
          fetchStockCodes(),
        ]);
        setData(result);
        const map: Record<string, string> = {};
        stockCodes.forEach(s => { map[s.code] = s.codeName; });
        setStockNameMap(map);
        setError(null);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('无法加载组合估值数据');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 根据选中的年份范围过滤数据
  const filteredData = useMemo(() => filterDataByYears(data, selectedYears), [data, selectedYears]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-gray-600 text-lg">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
        <p className="text-yellow-700 text-lg">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 时间范围选择按钮 */}
      <div className="flex flex-wrap gap-2">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.years}
            onClick={() => setSelectedYears(option.years)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedYears === option.years
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {chartConfigs.map((config) => (
        <SingleChart key={config.dataKey} data={filteredData} config={config} stockNameMap={stockNameMap} />
      ))}
    </div>
  );
};

export default PortfolioValuationChart;
