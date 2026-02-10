'use client';

import { useState, useEffect } from 'react';
import { fetchStockBonusData, StockBonusData } from '@/lib/api';

interface StockBonusProps {
  code: string;
  codeName?: string;
}

export default function StockBonus({ code, codeName }: StockBonusProps) {
  const [bonusData, setBonusData] = useState<StockBonusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBonusData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStockBonusData(code);
        setBonusData(data);
      } catch (err) {
        console.error('Failed to load stock bonus data:', err);
        setError('无法加载分红数据');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      loadBonusData();
    }
  }, [code]);

  // 格式化金额显示
  const formatAmount = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return amount.toFixed(2);
  };

  // 格式化送转股显示
  const formatStockDividend = (dividend: number | null) => {
    if (dividend === null || dividend === undefined) return '-';
    return dividend.toFixed(2);
  };

  // 格式化日期显示
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    // 假设日期格式为YYYY-MM-DD或YYYYMMDD
    if (dateStr.includes('-')) {
      return dateStr;
    }
    // 如果是YYYYMMDD格式
    if (dateStr.length === 8) {
      return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
    }
    return dateStr;
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">加载分红数据中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (bonusData.length === 0) {
    return (
      <div className="p-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p>该股票暂无分红数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {codeName || code} 分红数据
        </h2>
        <p className="text-gray-600 text-sm">
          共 {bonusData.length} 条分红记录
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分红日期
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                分红方案
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                现金分红(元)
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                送转股(股)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bonusData.map((item, index) => (
              <tr key={`${item.code}-${item.dateStr}-${index}`} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(item.dateStr)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.bonusData || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatAmount(item.amount)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {formatStockDividend(item.stockDividend)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>注：现金分红单位为元/股，送转股单位为股/股</p>
      </div>
    </div>
  );
}