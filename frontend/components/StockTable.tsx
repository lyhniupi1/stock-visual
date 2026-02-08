"use client";

import { useEffect, useState } from 'react';
import { fetchSimplifiedStocks, SimplifiedStock } from '@/lib/api';

const StockTable = () => {
  const [stocks, setStocks] = useState<SimplifiedStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // 获取今天的日期，格式为YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const loadStocks = async (date?: string) => {
    try {
      setLoading(true);
      const data = await fetchSimplifiedStocks(date);
      setStocks(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load stocks:', err);
      setError('无法加载股票数据，请检查后端服务是否运行');
      // 使用静态数据作为后备
      setStocks([
        { code: '000001', name: '平安银行', price: 10.25, change: '+2.5%', pe: 8.5, pb: 0.9, volume: '1.2亿' },
        { code: '000002', name: '万科A', price: 8.76, change: '-1.2%', pe: 6.3, pb: 0.7, volume: '0.8亿' },
        { code: '000858', name: '五粮液', price: 145.60, change: '+3.8%', pe: 25.4, pb: 5.2, volume: '2.1亿' },
        { code: '600519', name: '贵州茅台', price: 1680.50, change: '+1.5%', pe: 32.1, pb: 8.7, volume: '0.5亿' },
        { code: '300750', name: '宁德时代', price: 185.30, change: '-0.8%', pe: 18.9, pb: 3.4, volume: '3.2亿' },
        { code: '002415', name: '海康威视', price: 32.45, change: '+0.9%', pe: 15.2, pb: 2.1, volume: '1.8亿' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初始加载时使用今天的日期
    const today = getTodayDate();
    setSelectedDate(today);
    loadStocks(today);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    loadStocks(newDate);
  };

  const handleRefresh = () => {
    loadStocks(selectedDate);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">正在加载股票数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center">
          <div className="text-red-500 mr-3">⚠️</div>
          <div>
            <h3 className="text-lg font-bold text-red-800">数据加载失败</h3>
            <p className="text-red-700">{error}</p>
            <p className="text-red-700 mt-2">请确保后端服务正在运行（端口8080）</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          <div>
            <h3 className="text-lg font-bold text-blue-800">按日期查询股票数据</h3>
            <p className="text-blue-700 text-sm">选择日期查看当日所有股票列表，而不是限制100条数据</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="date-picker" className="text-gray-700 font-medium">选择日期：</label>
              <input
                id="date-picker"
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              刷新
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">共 {stocks.length} 只股票</h3>
          <p className="text-gray-600 text-sm">日期：{selectedDate}，点击股票代码查看详情</p>
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="搜索股票代码或名称..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">股票代码</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">股票名称</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最新价</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">涨跌幅</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PE(TTM)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PB(MRQ)</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成交量</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stocks.map((stock) => (
            <tr key={stock.code} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-mono font-bold text-blue-600">{stock.code}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{stock.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-lg font-bold text-gray-900">¥{stock.price.toFixed(2)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  stock.change.startsWith('+') 
                    ? 'bg-green-100 text-green-800' 
                    : stock.change.startsWith('-')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {stock.change}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`font-medium ${stock.pe > 20 ? 'text-red-600' : stock.pe > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {stock.pe.toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`font-medium ${stock.pb > 3 ? 'text-red-600' : stock.pb > 1.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {stock.pb.toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-gray-900">{stock.volume}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200">
                    查看
                  </button>
                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200">
                    加入自选
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-sm text-gray-500">
        <p>数据来源：本地数据库，最后更新：{new Date().toLocaleDateString('zh-CN')}</p>
      </div>
    </div>
  );
};

export default StockTable;