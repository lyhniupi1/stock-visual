"use client";

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import StockChart from '@/components/StockChart';
import { fetchStockHistory, fetchStockCodes } from '@/lib/api';
import Link from 'next/link';

interface StockData {
  code: string;
  date: string;
  codeName: string;
  open: number;
  high: number;
  low: number;
  close: number;
  preclose: number;
  volume: number;
  amount: number;
  adjustflag: number;
  turn: number;
  tradestatus: number;
  pctChg: number;
  peTTM: number;
  pbMRQ: number;
  psTTM: number;
  pcfNcfTTM: number;
  isST: number;
}

interface StockCode {
  code: string;
  codeName: string;
}

export default function StockDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const code = params?.code as string;
  const stockName = searchParams?.get('name') || '';
  
  const [historyData, setHistoryData] = useState<StockData[]>([]);
  const [stockCodes, setStockCodes] = useState<StockCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 并行获取股票历史数据和股票代码列表（用于导航）
        const [history, codes] = await Promise.all([
          fetchStockHistory(code, 1), // 获取全部数据（0表示不限制）
          fetchStockCodes(),
        ]);
        setHistoryData(history);
        setStockCodes(codes);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('获取数据失败，请稍后重试');
        // 如果获取股票代码失败，只获取历史数据
        try {
          const history = await fetchStockHistory(code, 1);
          setHistoryData(history);
          setStockCodes([]);
        } catch (fallbackErr) {
          console.error('Failed to fetch fallback data:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [code]);

  // 查找当前股票在列表中的位置
  const currentIndex = stockCodes.findIndex(stock => stock.code === code);
  const prevStock = currentIndex > 0 ? stockCodes[currentIndex - 1] : null;
  const nextStock = currentIndex < stockCodes.length - 1 ? stockCodes[currentIndex + 1] : null;

  // 获取当前股票的完整名称
  const currentStock = stockCodes.find(stock => stock.code === code);
  const displayName = stockName || currentStock?.codeName || code;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">正在加载股票数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-red-800 mb-3">加载失败</h3>
          <p className="text-red-700">{error}</p>
          <div className="mt-4">
            <Link
              href="/stocks"
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              返回股票列表
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 导航栏 */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/stocks" 
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            返回股票列表
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {prevStock && (
            <Link 
              href={`/stocks/${prevStock.code}?name=${encodeURIComponent(prevStock.codeName || prevStock.code)}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              {prevStock.code}
            </Link>
          )}
          
          {nextStock && (
            <Link 
              href={`/stocks/${nextStock.code}?name=${encodeURIComponent(nextStock.codeName || nextStock.code)}`}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center"
            >
              {nextStock.code}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* 标题 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {displayName} ({code})
        </h1>
        <p className="text-lg text-gray-600">
          股票K线日线图与历史数据
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-500 mb-2">最新收盘价</div>
          <div className="text-3xl font-bold text-gray-900">
            ¥{historyData.length > 0 ? historyData[historyData.length - 1].close?.toFixed(2) : 'N/A'}
          </div>
          <div className="text-sm text-gray-500 mt-2">
            日期: {historyData.length > 0 ? new Date(historyData[historyData.length - 1].date).toLocaleDateString('zh-CN') : 'N/A'}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-500 mb-2">PE(TTM)</div>
          <div className={`text-3xl font-bold ${historyData.length > 0 && historyData[historyData.length - 1].peTTM ?
            (historyData[historyData.length - 1].peTTM > 20 ? 'text-red-600' :
             historyData[historyData.length - 1].peTTM > 10 ? 'text-yellow-600' : 'text-green-600') : 'text-gray-900'}`}>
            {historyData.length > 0 && historyData[historyData.length - 1].peTTM ?
              historyData[historyData.length - 1].peTTM.toFixed(2) : 'N/A'}
          </div>
          <div className="text-sm text-gray-500 mt-2">市盈率</div>
          <div className="mt-4">
            <Link
              href={`/stocks/${code}/pepb-chart${stockName ? `?name=${encodeURIComponent(stockName)}` : ''}`}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              查看历史曲线
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-sm text-gray-500 mb-2">PB(MRQ)</div>
          <div className={`text-3xl font-bold ${historyData.length > 0 && historyData[historyData.length - 1].pbMRQ ?
            (historyData[historyData.length - 1].pbMRQ > 3 ? 'text-red-600' :
             historyData[historyData.length - 1].pbMRQ > 1.5 ? 'text-yellow-600' : 'text-green-600') : 'text-gray-900'}`}>
            {historyData.length > 0 && historyData[historyData.length - 1].pbMRQ ?
              historyData[historyData.length - 1].pbMRQ.toFixed(2) : 'N/A'}
          </div>
          <div className="text-sm text-gray-500 mt-2">市净率</div>
          <div className="mt-4">
            <Link
              href={`/stocks/${code}/pepb-chart${stockName ? `?name=${encodeURIComponent(stockName)}` : ''}`}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              查看历史曲线
            </Link>
          </div>
        </div>
      </div>

      {/* K线图 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">K线日线图</h2>
        <StockChart stockCode={code} stockName={displayName} limit={0} />
      </div>


      {/* 说明区域 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-3">图表说明</h3>
        <ul className="list-disc pl-5 text-blue-700 space-y-2">
          <li>K线图显示每日的开盘价、收盘价、最高价和最低价</li>
          <li>绿色K线表示当日上涨（收盘价≥开盘价），红色表示下跌（收盘价＜开盘价）</li>
          <li>上下影线显示当日价格波动范围</li>
          <li>数据来源于本地数据库的StockDayPepbData表</li>
          <li>点击导航按钮可以查看相邻股票的数据</li>
        </ul>
      </div>
    </div>
  );
}