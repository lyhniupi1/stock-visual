'use client';

import { useEffect, useState } from 'react';
import { fetchEpsPredictData, EpsPredictData } from '@/lib/api';

interface EpsPredictChartProps {
  stockCode: string;
  stockName?: string;
}

const EpsPredictChart = ({ stockCode, stockName = '' }: EpsPredictChartProps) => {
  const [epsData, setEpsData] = useState<EpsPredictData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载 EPS 预测数据
  useEffect(() => {
    const loadEpsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEpsPredictData(stockCode);
        setEpsData(data);
      } catch (err) {
        console.error('Failed to load EPS predict data:', err);
        setError('无法加载 EPS 预测数据');
      } finally {
        setLoading(false);
      }
    };

    if (stockCode) {
      loadEpsData();
    }
  }, [stockCode]);

  // 计算统计数据
  const calculateStats = () => {
    if (epsData.length === 0) return null;

    const allEpsValues: number[] = [];
    const allPeValues: number[] = [];

    epsData.forEach(item => {
      [item.eps1, item.eps2, item.eps3, item.eps4].forEach(eps => {
        if (eps !== null) allEpsValues.push(eps);
      });
      [item.pe1, item.pe2, item.pe3, item.pe4].forEach(pe => {
        if (pe !== null) allPeValues.push(pe);
      });
    });

    if (allEpsValues.length === 0) return null;

    const currentEps = allEpsValues[0]; // 最新的数据
    const avgEps = allEpsValues.reduce((sum, eps) => sum + eps, 0) / allEpsValues.length;
    const maxEps = Math.max(...allEpsValues);
    const minEps = Math.min(...allEpsValues);

    const avgPe = allPeValues.length > 0 
      ? allPeValues.reduce((sum, pe) => sum + pe, 0) / allPeValues.length 
      : null;

    return {
      currentEps,
      averageEps: avgEps,
      maxEps,
      minEps,
      averagePe: avgPe,
      orgCount: epsData.length,
      dataCount: allEpsValues.length,
    };
  };

  const stats = calculateStats();

  // 格式化数字显示
  const formatNumber = (value: number | null, precision: number = 3) => {
    if (value === null || value === undefined) return '-';
    return value.toFixed(precision);
  };

  // 格式化年份显示
  const formatYear = (year: string, mark: string) => {
    if (!year || year.trim() === '') return '-';
    return `${year}${mark}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">加载 EPS 预测数据中...</div>
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

  if (epsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">暂无 EPS 预测数据</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          {stockName || stockCode} - EPS 预测分析
        </h2>
        <p className="text-gray-600 mt-1">
          股票代码: {stockCode} | 数据来源: eastmoney_org_eps_predict表
        </p>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">当前 EPS 预测</div>
            <div className="text-2xl font-bold text-green-600 mt-1">
              {formatNumber(stats.currentEps)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">平均 EPS 预测</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">
              {formatNumber(stats.averageEps)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">最高 EPS 预测</div>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {formatNumber(stats.maxEps)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-500">平均 PE 预测</div>
            <div className="text-2xl font-bold text-purple-600 mt-1">
              {formatNumber(stats.averagePe, 1)}
            </div>
          </div>
        </div>
      )}

      {/* 数据说明 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm text-gray-600">
          <p className="mb-1">
            <span className="font-medium">EPS（每股收益）</span>：预测公司未来每股的盈利水平，单位：元。
          </p>
          <p className="mb-1">
            <span className="font-medium">PE（市盈率）</span>：预测公司未来股价与每股收益的比率。
          </p>
          <p>
            <span className="font-medium">数据说明</span>：数据来源于东方财富 eastmoney_org_eps_predict 表，包含多家机构对未来4年的预测。
          </p>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">EPS 预测数据详情</h3>
          <p className="text-sm text-gray-500 mt-1">
            共 {epsData.length} 家机构提供预测数据
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  机构名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  年份1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EPS1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PE1
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  年份2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EPS2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PE2
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  年份3
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EPS3
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PE3
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  年份4
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EPS4
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PE4
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {epsData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.orgNameAbbr}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatYear(item.year1, item.yearMark1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(item.eps1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(item.pe1, 1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatYear(item.year2, item.yearMark2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(item.eps2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(item.pe2, 1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatYear(item.year3, item.yearMark3)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(item.eps3)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(item.pe3, 1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatYear(item.year4, item.yearMark4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(item.eps4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatNumber(item.pe4, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EpsPredictChart;