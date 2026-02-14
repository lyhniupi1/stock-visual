'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  getPortfolioById,
  Portfolio,
  fetchMultipleStocksByTwoDates,
  StockData
} from '@/lib/api';

interface StockDetail {
  code: string;
  name: string;
  quantity: number;
  costPrice: number;
  t1Data: StockData | null;
  t2Data: StockData | null;
}

export default function PortfolioDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [t1, setT1] = useState<string>('');
  const [t2, setT2] = useState<string>('');
  const [stockDetails, setStockDetails] = useState<StockDetail[]>([]);
  const [fetchingData, setFetchingData] = useState(false);

  // 获取组合详情
  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const data = await getPortfolioById(parseInt(id));
        setPortfolio(data);
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPortfolio();
  }, [id]);

  // 查询股票数据
  const handleQuery = async () => {
    if (!portfolio || !t1 || !t2) return;
    
    setFetchingData(true);
    try {
      const stocks = portfolio.stocks;
      const codes = stocks.map(s => s.code);
      
      // 一次性获取所有股票在t1和t2的数据
      const results = await fetchMultipleStocksByTwoDates(codes, t1, t2);

      // 合并数据
      const details: StockDetail[] = stocks.map(stock => {
        const stockResult = results[stock.code];
        return {
          code: stock.code,
          name: stock.name,
          quantity: stock.quantity,
          costPrice: stock.costPrice,
          t1Data: stockResult?.t1 || null,
          t2Data: stockResult?.t2 || null,
        };
      });

      setStockDetails(details);
    } catch (error) {
      console.error('Failed to fetch stock data:', error);
    } finally {
      setFetchingData(false);
    }
  };

  // 计算涨跌幅
  const calculateChange = (t1Data: StockData | null, t2Data: StockData | null) => {
    if (!t1Data?.close || !t2Data?.close) return '-';
    const change = ((t2Data.close - t1Data.close) / t1Data.close) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  // 计算盈亏金额
  const calculateProfit = (detail: StockDetail) => {
    if (!detail.t1Data?.close || !detail.t2Data?.close) return '-';
    const profit = (detail.t2Data.close - detail.t1Data.close) * detail.quantity;
    return profit.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">组合不存在</h2>
        <Link
          href="/portfolios"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回组合列表
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 标题和操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/portfolios"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← 返回列表
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{portfolio.name}</h1>
        </div>
        <div className="text-sm text-gray-500">
          创建时间: {portfolio.createdAt}
        </div>
      </div>

      {/* 组合概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500 mb-1">股票数量</div>
          <div className="text-2xl font-bold text-gray-900">{portfolio.stockCount}</div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500 mb-1">初始市值</div>
          <div className="text-2xl font-bold text-gray-900">
            ¥{portfolio.initialValue.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500 mb-1">当前市值</div>
          <div className="text-2xl font-bold text-gray-900">
            ¥{portfolio.currentValue.toFixed(2)}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <div className="text-sm text-gray-500 mb-1">总盈亏</div>
          <div className={`text-2xl font-bold ${portfolio.profitPercent >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {portfolio.profitPercent >= 0 ? '+' : ''}{portfolio.profitPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* 时间范围选择器 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📅 时间范围选择</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">开始时间 (T1):</label>
            <input
              type="date"
              value={t1}
              onChange={(e) => setT1(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">结束时间 (T2):</label>
            <input
              type="date"
              value={t2}
              onChange={(e) => setT2(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            onClick={handleQuery}
            disabled={!t1 || !t2 || fetchingData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {fetchingData ? '查询中...' : '查询数据'}
          </button>
        </div>
      </div>

      {/* 股票明细表格 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 股票明细分析</h2>
        {stockDetails.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-2">📈</div>
            <p>请选择时间范围并点击"查询数据"查看股票明细</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">股票代码</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">股票名称</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">持仓数量</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">成本价</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">T1收盘价</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">T2收盘价</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">涨跌幅</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">T1 PE</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">T1 PB</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">T2 PE</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">T2 PB</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">盈亏金额</th>
                </tr>
              </thead>
              <tbody>
                {stockDetails.map((detail, index) => (
                  <tr 
                    key={detail.code} 
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <Link 
                        href={`/stocks/${detail.code}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {detail.code}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{detail.name}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{detail.quantity}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">{detail.costPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {detail.t1Data?.close?.toFixed(2) || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {detail.t2Data?.close?.toFixed(2) || '-'}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      (() => {
                        const change = calculateChange(detail.t1Data, detail.t2Data);
                        if (change === '-') return 'text-gray-500';
                        return change.startsWith('+') ? 'text-red-600' : 'text-green-600';
                      })()
                    }`}>
                      {calculateChange(detail.t1Data, detail.t2Data)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {detail.t1Data?.peTTM?.toFixed(2) || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {detail.t1Data?.pbMRQ?.toFixed(2) || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {detail.t2Data?.peTTM?.toFixed(2) || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                      {detail.t2Data?.pbMRQ?.toFixed(2) || '-'}
                    </td>
                    <td className={`px-4 py-3 text-sm text-right font-medium ${
                      (() => {
                        const profit = calculateProfit(detail);
                        if (profit === '-') return 'text-gray-500';
                        return parseFloat(profit) >= 0 ? 'text-red-600' : 'text-green-600';
                      })()
                    }`}>
                      {calculateProfit(detail) !== '-' ? `¥${calculateProfit(detail)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* 组合综合收益率分析（等份额） */}
      {stockDetails.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📊 组合综合收益率分析（等份额）</h2>
          {(() => {
            // 过滤掉没有t1或t2数据的股票
            const validDetails = stockDetails.filter(
              d => d.t1Data?.close && d.t2Data?.close
            );
            
            if (validDetails.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500">
                  <p>没有足够的数据计算组合收益率</p>
                </div>
              );
            }

            // 等份额计算：假设每只股票投入相同的金额
            // 买入价格之和
            const totalT1Value = validDetails.reduce(
              (sum, d) => sum + d.t1Data!.close,
              0
            );
            // 卖出价格之和
            const totalT2Value = validDetails.reduce(
              (sum, d) => sum + d.t2Data!.close,
              0
            );
            
            // 组合收益率 = (期末总值 - 期初总值) / 期初总值 * 100
            const portfolioReturn = ((totalT2Value - totalT1Value) / totalT1Value) * 100;
            
            // 个股平均收益率
            const avgStockReturn = validDetails.reduce((sum, d) => {
              const stockReturn = ((d.t2Data!.close - d.t1Data!.close) / d.t1Data!.close) * 100;
              return sum + stockReturn;
            }, 0) / validDetails.length;

            // 计算时间差（天数）
            const t1Date = new Date(validDetails[0].t1Data!.date);
            const t2Date = new Date(validDetails[0].t2Data!.date);
            const daysDiff = Math.max(1, Math.ceil((t2Date.getTime() - t1Date.getTime()) / (1000 * 60 * 60 * 24)));
            const years = daysDiff / 365;
            
            // 年化收益率 = (1 + 收益率) ^ (1 / 年数) - 1
            const annualizedReturn = (Math.pow(1 + portfolioReturn / 100, 1 / years) - 1) * 100;

            return (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600 mb-1">T1 期初总值</div>
                  <div className="text-xl font-bold text-blue-900">
                    ¥{totalT1Value.toFixed(2)}
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    {validDetails.length} 只股票等份额
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-green-600 mb-1">T2 期末总值</div>
                  <div className="text-xl font-bold text-green-900">
                    ¥{totalT2Value.toFixed(2)}
                  </div>
                  <div className="text-xs text-green-500 mt-1">
                    较期初 {totalT2Value >= totalT1Value ? '+' : ''}
                    ¥{(totalT2Value - totalT1Value).toFixed(2)}
                  </div>
                </div>
                <div className={`rounded-lg p-4 ${portfolioReturn >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <div className={`text-sm mb-1 ${portfolioReturn >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    组合收益率
                  </div>
                  <div className={`text-2xl font-bold ${portfolioReturn >= 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(2)}%
                  </div>
                  <div className={`text-xs mt-1 ${portfolioReturn >= 0 ? 'text-red-500' : 'text-green-500'}`}>
                    等份额加权
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">个股平均收益率</div>
                  <div className={`text-xl font-bold ${avgStockReturn >= 0 ? 'text-red-900' : 'text-green-900'}`}>
                    {avgStockReturn >= 0 ? '+' : ''}{avgStockReturn.toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    算术平均
                  </div>
                </div>
                <div className={`rounded-lg p-4 ${annualizedReturn >= 0 ? 'bg-purple-50' : 'bg-orange-50'}`}>
                  <div className={`text-sm mb-1 ${annualizedReturn >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>
                    年化收益率
                  </div>
                  <div className={`text-2xl font-bold ${annualizedReturn >= 0 ? 'text-purple-900' : 'text-orange-900'}`}>
                    {annualizedReturn >= 0 ? '+' : ''}{annualizedReturn.toFixed(2)}%
                  </div>
                  <div className={`text-xs mt-1 ${annualizedReturn >= 0 ? 'text-purple-500' : 'text-orange-500'}`}>
                    持有 {daysDiff} 天（{years.toFixed(2)} 年）
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* 预留功能区 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">📈 持仓分析</h3>
          <p className="text-gray-500 text-sm">各股票持仓占比、行业分布等</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">💰 盈亏分析</h3>
          <p className="text-gray-500 text-sm">个股盈亏、累计收益等</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">📅 历史记录</h3>
          <p className="text-gray-500 text-sm">调仓记录、分红记录等</p>
        </div>
      </div>
    </div>
  );
}
