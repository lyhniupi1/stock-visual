"use client";

import { useEffect, useState } from 'react';
import { fetchBanksByDate, StockData } from '@/lib/api';

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface BankStock {
  code: string;
  name: string;
  price: number;
  change: string;
  pe: number;
  pb: number;
  volume: string;
  dividendYield: string;
  eps?: number;
  dividendPayRatio?: number;
  predictDividendRatio?: number;
}

const BankTable = () => {
  const [banks, setBanks] = useState<BankStock[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 200,
    totalPages: 0,
  });
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

  const loadBanks = async (date: string, page: number = 1, pageSize: number = 20) => {
    try {
      setLoading(true);
      const result = await fetchBanksByDate(date, page, pageSize);
      // 转换为简化格式
      const simplifiedData = result.data.map((stock: StockData) => ({
        code: stock.code,
        name: stock.codeName || stock.code,
        price: stock.close || 0,
        change: stock.pctChg ? `${stock.pctChg > 0 ? '+' : ''}${stock.pctChg.toFixed(2)}%` : '0.00%',
        pe: stock.peTTM || 0,
        pb: stock.pbMRQ || 0,
        volume: stock.volume ? `${(stock.volume / 10000).toFixed(1)}万` : '0',
        dividendYield: stock.dividendYield ? `${(stock.dividendYield * 100).toFixed(2)}%` : '0.00%',
        eps: stock.eps || 0,
        dividendPayRatio: stock.dividendPayRatio || 0,
        predictDividendRatio: stock.predictDividendRatio || 0,
      }));
      setBanks(simplifiedData);
      setPagination({
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
      setError(null);
    } catch (err) {
      console.error('Failed to load banks:', err);
      setError('无法加载银行数据，请检查后端服务是否运行');
      setBanks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = getTodayDate();
    setSelectedDate(today);
    loadBanks(today, 1, 200);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
  };

  const handleRefresh = () => {
    loadBanks(selectedDate, 1, pagination.pageSize);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadBanks(selectedDate, newPage, pagination.pageSize);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10);
    loadBanks(selectedDate, 1, newPageSize);
  };

  const handleViewStock = (code: string, name: string) => {
    const url = `/stocks/${code}?name=${encodeURIComponent(name)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">正在加载银行数据...</p>
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
            <h3 className="text-lg font-bold text-blue-800">按日期查询银行股数据</h3>
            <p className="text-blue-700 text-sm">选择日期后点击"查询"按钮查看当日所有银行股票列表</p>
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              查询
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            共 {pagination.total} 只银行股（第 {pagination.page}/{pagination.totalPages} 页）
          </h3>
          <p className="text-gray-600 text-sm">日期：{selectedDate}，每页显示 {pagination.pageSize} 条</p>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="page-size" className="text-gray-700 text-sm">每页显示：</label>
          <select
            id="page-size"
            value={pagination.pageSize}
            onChange={handlePageSizeChange}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">股票排名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">股票代码</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">股票名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最新价</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">涨跌幅</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PE(TTM)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PB(MRQ)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">历史股息率</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预测EPS</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">股息支付率</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预测股息率</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成交量</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banks.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-6 py-12 text-center text-gray-500">
                  该日期暂无银行股数据
                </td>
              </tr>
            ) : (
              banks.map((bank, index) => (
                <tr key={bank.code} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-600">{(pagination.page - 1) * pagination.pageSize + index + 1}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono font-bold text-blue-600">{bank.code}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{bank.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-bold text-gray-900">¥{bank.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                      bank.change.startsWith('+')
                        ? 'bg-green-100 text-green-800'
                        : bank.change.startsWith('-')
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {bank.change}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${bank.pe > 20 ? 'text-red-600' : bank.pe > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {bank.pe.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${bank.pb > 3 ? 'text-red-600' : bank.pb > 1.5 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {bank.pb.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${parseFloat(bank.dividendYield) > 5 ? 'text-green-600' : parseFloat(bank.dividendYield) > 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {bank.dividendYield}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${(bank.eps || 0) > 1 ? 'text-green-600' : (bank.eps || 0) > 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {bank.eps ? bank.eps.toFixed(3) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${(bank.dividendPayRatio || 0) > 50 ? 'text-green-600' : (bank.dividendPayRatio || 0) > 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {bank.dividendPayRatio ? `${bank.dividendPayRatio.toFixed(1)}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${(bank.predictDividendRatio || 0) > 0.05 ? 'text-green-600' : (bank.predictDividendRatio || 0) > 0.03 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {bank.predictDividendRatio ? `${(bank.predictDividendRatio * 100).toFixed(2)}%` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-900">{bank.volume}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleViewStock(bank.code, bank.name)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页控件 */}
      {pagination.totalPages > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="text-sm text-gray-600">
            显示第 {(pagination.page - 1) * pagination.pageSize + 1} 到{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，共 {pagination.total} 条
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded-lg ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              首页
            </button>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className={`px-3 py-1 rounded-lg ${pagination.page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              上一页
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg ${pagination.page === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-3 py-1 rounded-lg ${pagination.page === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              下一页
            </button>
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
              className={`px-3 py-1 rounded-lg ${pagination.page === pagination.totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              末页
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>数据来源：本地数据库，最后更新：{new Date().toLocaleDateString('zh-CN')}</p>
      </div>
    </div>
  );
};

export default BankTable;
