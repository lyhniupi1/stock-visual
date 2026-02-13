'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPortfolios, deletePortfolio, Portfolio } from '@/lib/api';

export default function PortfolioList() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const data = await getPortfolios();
      setPortfolios(data);
      setError(null);
    } catch (err) {
      setError('加载组合列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个组合吗？')) return;
    
    try {
      await deletePortfolio(id);
      setPortfolios(portfolios.filter(p => p.id !== id));
    } catch (err) {
      alert('删除失败');
      console.error(err);
    }
  };

  // 格式化百分比
  const formatPercent = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // 格式化金额
  const formatMoney = (value: number): string => {
    return `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
        <button
          onClick={loadPortfolios}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          重新加载
        </button>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <p className="text-gray-500 text-lg mb-4">暂无股票组合</p>
        <Link
          href="/portfolios/create"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          创建第一个组合
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {portfolios.map((portfolio) => (
        <div
          key={portfolio.id}
          className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between">
            {/* 组合信息 */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
              {/* 组合名称 */}
              <div className="md:col-span-1">
                <h3 className="text-lg font-bold text-gray-900">{portfolio.name}</h3>
                <p className="text-sm text-gray-500">组合 #{portfolio.id}</p>
              </div>

              {/* 持仓数目 */}
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{portfolio.stockCount}</p>
                <p className="text-sm text-gray-500">持仓股票</p>
              </div>

              {/* 建仓时间 */}
              <div className="text-center">
                <p className="text-lg font-medium text-gray-800">{portfolio.createdAt}</p>
                <p className="text-sm text-gray-500">建仓时间</p>
              </div>

              {/* 当前市值 */}
              <div className="text-center">
                <p className="text-lg font-medium text-gray-800">{formatMoney(portfolio.currentValue)}</p>
                <p className="text-sm text-gray-500">当前市值</p>
              </div>

              {/* 盈亏百分比 */}
              <div className="text-center">
                <p className={`text-2xl font-bold ${portfolio.profitPercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatPercent(portfolio.profitPercent)}
                </p>
                <p className="text-sm text-gray-500">建仓以来盈亏</p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-3 ml-6">
              <Link
                href={`/portfolios/${portfolio.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                查看明细
              </Link>
              <button
                onClick={() => handleDelete(portfolio.id)}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
