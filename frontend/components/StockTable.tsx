"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSimplifiedStocks, SimplifiedStock } from '@/lib/api';

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const StockTable = () => {
  const router = useRouter();
  const [stocks, setStocks] = useState<SimplifiedStock[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 20,
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

  const loadStocks = async (date?: string, page: number = 1, pageSize: number = 20) => {
    try {
      setLoading(true);
      const result = await fetchSimplifiedStocks(date, page, pageSize);
      setStocks(result.data);
      setPagination({
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
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
      setPagination({
        total: 6,
        page: 1,
        pageSize: 20,
        totalPages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 初始加载时使用今天的日期
    const today = getTodayDate();
    setSelectedDate(today);
    loadStocks(today, 1, 20);
  }, []);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    // 不再立即加载数据，等待用户点击刷新按钮
  };

  const handleRefresh = () => {
    // 重置到第一页，因为日期改变了
    loadStocks(selectedDate, 1, pagination.pageSize);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadStocks(selectedDate, newPage, pagination.pageSize);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value, 10);
    loadStocks(selectedDate, 1, newPageSize);
  };

  const handleViewStock = (code: string, name: string) => {
    router.push(`/stocks/${code}?name=${encodeURIComponent(name)}`);
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
            <p className="text-blue-700 text-sm">选择日期后点击"查询"按钮查看当日所有股票列表</p>
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
            共 {pagination.total} 只股票（第 {pagination.page}/{pagination.totalPages} 页）
          </h3>
          <p className="text-gray-600 text-sm">日期：{selectedDate}，每页显示 {pagination.pageSize} 条</p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="搜索股票代码或名称..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
                  <button
                    onClick={() => handleViewStock(stock.code, stock.name)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                  >
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

export default StockTable;