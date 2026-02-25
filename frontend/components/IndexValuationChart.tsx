'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchIndexValuationData, fetchIndexCodes, IndexValuationData } from '@/lib/api';
import * as lwc from 'lightweight-charts';

interface ChartData {
  time: string;
  value: number;
}





// 辅助函数：计算分位数（百分位）
const getPercentile = (numbers: number[], value: number): number => {
  if (numbers.length === 0) return 0;
  // 过滤掉无效值
  const validNumbers = numbers.filter(num => !isNaN(num));
  if (validNumbers.length === 0) return 0;
  // 计算小于value的元素数量（百分位排名）
  const countLess = validNumbers.filter(num => num < value).length;
  console.log(countLess, validNumbers.length)
  // 计算分位数（百分比）
  return (countLess / validNumbers.length) * 100;
};

// 子组件：显示最新值的分位数
interface PercentileDisplayProps {
  data: IndexValuationData[];
  field: 'pe' | 'pb' | 'roe';
  label?: string;
}

const PercentileDisplay = ({ data, field, label }: PercentileDisplayProps) => {
  console.log(data)
  if (data.length === 0) {
    return <div className="text-sm text-gray-500">无数据</div>;
  }

  // 提取字段值
  const values = data.map(item => item[field]).filter(val => val !== null && !isNaN(val)) as number[];
  if (values.length === 0) {
    return <div className="text-sm text-gray-500">无有效数据</div>;
  }

  const latestValue = data[0][field];
  console.log(latestValue);
  
  if (latestValue === null || isNaN(latestValue)) {
    return <div className="text-sm text-gray-500">最新值无效</div>;
  }

  const percentile = getPercentile(values, latestValue);
  const displayLabel = label || (field === 'pe' ? 'PE' : field === 'pb' ? 'PB' : 'ROE');

  // 确定值的显示格式
  const valueSuffix = '';
  return (
    <div className="space-y-1">
      <div>最新{displayLabel}: {latestValue.toFixed(2)}{valueSuffix}</div>
      <div>历史分位数: {percentile.toFixed(1)}%</div>
    </div>
  );
};

const IndexValuationChart = () => {
  const peChartContainerRef = useRef<HTMLDivElement>(null);
  const pbChartContainerRef = useRef<HTMLDivElement>(null);
  const roeChartContainerRef = useRef<HTMLDivElement>(null);
  
  const peChartRef = useRef<any>(null);
  const pbChartRef = useRef<any>(null);
  const roeChartRef = useRef<any>(null);
  
  const [indexData, setIndexData] = useState<IndexValuationData[]>([]);
  const [indexCodes, setIndexCodes] = useState<{ code: string; codeName: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'1Y' | '3Y' | '5Y' | '10Y' | 'ALL'>('ALL');
  const [limit, setLimit] = useState<number>(0);

  // 根据时间范围计算 limit
  const getLimitFromTimeRange = (range: '1Y' | '3Y' | '5Y' | '10Y' | 'ALL'): number => {
    switch (range) {
      case '1Y':
        return 1 * 250;
      case '3Y':
        return 3 * 250;
      case '5Y':
        return 5 * 250;
      case '10Y':
        return 10 * 250;
      case 'ALL':
        return 0; // 0 表示获取所有数据
      default:
        return 0;
    }
  };

  // 初始化limit值
  useEffect(() => {
    const initialLimit = getLimitFromTimeRange('3Y');
    setLimit(initialLimit);
  }, []);

  // 加载指数代码
  useEffect(() => {
    const loadIndexCodes = async () => {
      try {
        const codes = await fetchIndexCodes();
        setIndexCodes(codes);
        if (codes.length > 0) {
          setSelectedIndex(codes[0].code);
        }
      } catch (err) {
        console.error('Failed to load index codes:', err);
      }
    };
    loadIndexCodes();
  }, []);

  // 加载指数估值数据
  useEffect(() => {
    const loadIndexData = async () => {
      if (!selectedIndex) return;
      
      try {
        setLoading(true);
        const data = await fetchIndexValuationData(selectedIndex, limit);
        setIndexData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load index valuation data:', err);
        setError('无法加载指数估值数据');
        // 使用模拟数据作为后备
        setIndexData(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    loadIndexData();
  }, [selectedIndex, limit]);

  // 初始化图表
  useEffect(() => {
    if (!indexData.length || !peChartContainerRef.current || !pbChartContainerRef.current || !roeChartContainerRef.current) {
      return;
    }

    // 清理之前的图表
    // if (peChartRef.current) {
    //   peChartRef.current.remove();
    //   peChartRef.current = null;
    // }
    // if (pbChartRef.current) {
    //   pbChartRef.current.remove();
    //   pbChartRef.current = null;
    // }
    // if (roeChartRef.current) {
    //   roeChartRef.current.remove();
    //   roeChartRef.current = null;
    // }

    // 准备数据
    const peData: ChartData[] = [];
    const pbData: ChartData[] = [];
    const roeData: ChartData[] = [];

    // 按日期排序（从旧到新）
    const sortedData = [...indexData].sort((a, b) => a.date.localeCompare(b.date));
    
    sortedData.forEach(item => {
      if (item.pe !== null && !isNaN(item.pe)) {
        peData.push({ time: item.date, value: item.pe });
      }
      if (item.pb !== null && !isNaN(item.pb)) {
        pbData.push({ time: item.date, value: item.pb });
      }
      if (item.roe !== null && !isNaN(item.roe)) {
        roeData.push({ time: item.date, value: item.roe });
      }
    });

    // 创建PE图表
    const peChart = lwc.createChart(peChartContainerRef.current, {
      width: peChartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
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

    const peSeries = peChart.addSeries(lwc.LineSeries, {
      color: '#3b82f6',
      lineWidth: 2,
      title: 'PE',
    });
    peSeries.setData(peData);

    // 创建PB图表
    const pbChart = lwc.createChart(pbChartContainerRef.current, {
      width: pbChartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
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

    const pbSeries = pbChart.addSeries(lwc.LineSeries, {
      color: '#10b981',
      lineWidth: 2,
      title: 'PB',
    });
    pbSeries.setData(pbData);

    // 创建ROE图表
    const roeChart = lwc.createChart(roeChartContainerRef.current, {
      width: roeChartContainerRef.current.clientWidth,
      height: 300,
      layout: {
        background: { color: '#ffffff' },
        textColor: '#333',
      },
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
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

    const roeSeries = roeChart.addSeries(lwc.LineSeries, {
      color: '#8b5cf6',
      lineWidth: 2,
      title: 'ROE',
    });
    roeSeries.setData(roeData);

    // 保存图表引用
    peChartRef.current = peChart;
    pbChartRef.current = pbChart;
    roeChartRef.current = roeChart;

    // 响应窗口大小变化
    const handleResize = () => {
      if (peChartRef.current && peChartContainerRef.current) {
        peChartRef.current.applyOptions({ width: peChartContainerRef.current.clientWidth });
      }
      if (pbChartRef.current && pbChartContainerRef.current) {
        pbChartRef.current.applyOptions({ width: pbChartContainerRef.current.clientWidth });
      }
      if (roeChartRef.current && roeChartContainerRef.current) {
        roeChartRef.current.applyOptions({ width: roeChartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (peChartRef.current) {
        peChartRef.current.remove();
      }
      if (pbChartRef.current) {
        pbChartRef.current.remove();
      }
      if (roeChartRef.current) {
        roeChartRef.current.remove();
      }
    };
  }, [indexData]);

  // 处理指数选择变化
  const handleIndexChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIndex(e.target.value);
  };

  // 处理时间范围变化
  const handleTimeRangeChange = (range: '1Y' | '3Y' | '5Y' | '10Y' | 'ALL') => {
    setTimeRange(range);
    const newLimit = getLimitFromTimeRange(range);
    setLimit(newLimit);
    // limit 变化会触发 useEffect 重新获取数据
  };

  // 生成模拟数据（用于开发测试）
  const generateMockData = (): IndexValuationData[] => {
    const mockData: IndexValuationData[] = [];
    const startDate = new Date('2020-01-01');
    const selectedIndexName = indexCodes.find(code => code.code === selectedIndex)?.codeName || selectedIndex;
    
    for (let i = 0; i < 365 * 3; i += 30) { // 3年数据，每月一个点
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      // 生成一些有趋势的模拟数据
      const basePE = 15 + Math.sin(i / 100) * 5;
      const basePB = 1.5 + Math.cos(i / 120) * 0.5;
      const baseROE = 10 + Math.sin(i / 80) * 3;
      
      mockData.push({
        code: selectedIndex,
        date: dateStr,
        codeName: selectedIndexName,
        pe: basePE + Math.random() * 2,
        pb: basePB + Math.random() * 0.2,
        roe: baseROE + Math.random() * 1,
      });
    }
    
    return mockData;
  };

  if (loading && !indexData.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">加载指数估值数据中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-700 font-medium">错误: {error}</div>
        <div className="text-red-600 text-sm mt-2">正在使用模拟数据进行展示</div>
      </div>
    );
  }

  const selectedIndexName = indexCodes.find(code => code.code === selectedIndex)?.codeName || selectedIndex;

  // 计算统计数据
  const peValues = indexData.map(item => item.pe).filter(pe => pe !== null && !isNaN(pe)) as number[];
  const pbValues = indexData.map(item => item.pb).filter(pb => pb !== null && !isNaN(pb)) as number[];
  const roeValues = indexData.map(item => item.roe).filter(roe => roe !== null && !isNaN(roe)) as number[];

  const peAvg = peValues.length > 0 ? peValues.reduce((sum, num) => sum + num, 0) / peValues.length : 0;
  const pbAvg = pbValues.length > 0 ? pbValues.reduce((sum, num) => sum + num, 0) / pbValues.length : 0;
  const roeAvg = roeValues.length > 0 ? roeValues.reduce((sum, num) => sum + num, 0) / roeValues.length : 0;

  return (
    <div className="space-y-8">
      {/* 控制面板 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <label htmlFor="index-select" className="block text-sm font-medium text-gray-700 mb-1">
                选择指数
              </label>
              <select
                id="index-select"
                value={selectedIndex}
                onChange={handleIndexChange}
                className="block w-full md:w-64 rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {indexCodes.map((index) => (
                  <option key={index.code} value={index.code}>
                    {index.codeName} ({index.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                时间范围
              </label>
              <div className="flex space-x-2">
                {['1Y', '3Y', '5Y', '10Y', 'ALL'].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => handleTimeRangeChange(range as any)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      timeRange === range
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {range === '1Y' ? '1年' : 
                     range === '3Y' ? '3年' : 
                     range === '5Y' ? '5年' : 
                     range === '10Y' ? '10年' : '全部'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            <div>数据点数量: {indexData.length}</div>
            <div>时间范围: {indexData.length > 0 ? `${indexData[0].date} 至 ${indexData[indexData.length - 1].date}` : '无数据'}</div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 gap-8">
        {/* PE图表 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">市盈率 (PE) 趋势</h3>
              <p className="text-sm text-gray-600">指数市盈率随时间的变化</p>
            </div>
            <div className="text-sm text-gray-600">
              {indexData.length > 0 && (
                <PercentileDisplay data={indexData} field="pe" label="PE" />
              )}
            </div>
          </div>
          <div ref={peChartContainerRef} className="h-80" />
          <div className="mt-4 text-sm text-gray-500">
            <p>市盈率(PE) = 股价 / 每股收益，反映了投资者为每单位盈利支付的价格。</p>
          </div>
        </div>

        {/* PB图表 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">市净率 (PB) 趋势</h3>
              <p className="text-sm text-gray-600">指数市净率随时间的变化</p>
            </div>
            <div className="text-sm text-gray-600">
              {indexData.length > 0 && (
                <PercentileDisplay data={indexData} field="pb" label="PB" />
              )}
            </div>
          </div>
          <div ref={pbChartContainerRef} className="h-80" />
          <div className="mt-4 text-sm text-gray-500">
            <p>市净率(PB) = 股价 / 每股净资产，反映了股票价格相对于其账面价值的高低。</p>
          </div>
        </div>

        {/* ROE图表 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">净资产收益率 (ROE) 趋势</h3>
              <p className="text-sm text-gray-600">指数净资产收益率随时间的变化</p>
            </div>
            <div className="text-sm text-gray-600">
              {indexData.length > 0 && (
                <PercentileDisplay data={indexData} field="roe" label="ROE" />
              )}
            </div>
          </div>
          <div ref={roeChartContainerRef} className="h-80" />
          <div className="mt-4 text-sm text-gray-500">
            <p>净资产收益率(ROE) = 净利润 / 净资产，反映了公司利用股东资本创造利润的效率。</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default IndexValuationChart;