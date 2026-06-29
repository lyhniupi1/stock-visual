"use client";

import { useEffect, useState } from 'react';
import { fetchSimplifiedStocks, SimplifiedStock, fetchPercentileData, PercentileData } from '@/lib/api';

interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const StockTable = () => {
  const [stocks, setStocks] = useState<SimplifiedStock[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    pageSize: 200,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [percentileModal, setPercentileModal] = useState<{
    visible: boolean;
    loading: boolean;
    data: PercentileData | null;
    error: string | null;
  }>({ visible: false, loading: false, data: null, error: null });

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
      console.log(result.data)
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
        { code: '000001', name: '平安银行', price: 10.25, change: '+2.5%', pe: 8.5, pb: 0.9, volume: '1.2亿', dividendYield: '4.50%' },
        { code: '000002', name: '万科A', price: 8.76, change: '-1.2%', pe: 6.3, pb: 0.7, volume: '0.8亿', dividendYield: '5.20%' },
        { code: '000858', name: '五粮液', price: 145.60, change: '+3.8%', pe: 25.4, pb: 5.2, volume: '2.1亿', dividendYield: '1.80%' },
        { code: '600519', name: '贵州茅台', price: 1680.50, change: '+1.5%', pe: 32.1, pb: 8.7, volume: '0.5亿', dividendYield: '1.20%' },
        { code: '300750', name: '宁德时代', price: 185.30, change: '-0.8%', pe: 18.9, pb: 3.4, volume: '3.2亿', dividendYield: '0.50%' },
        { code: '002415', name: '海康威视', price: 32.45, change: '+0.9%', pe: 15.2, pb: 2.1, volume: '1.8亿', dividendYield: '2.80%' },
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
    loadStocks(today, 1, 200);
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
    const url = `/stocks/${code}?name=${encodeURIComponent(name)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleViewPercentile = async (code: string, name: string) => {
    setPercentileModal({ visible: true, loading: true, data: null, error: null });
    try {
      const data = await fetchPercentileData(code, selectedDate);
      setPercentileModal({ visible: true, loading: false, data, error: null });
    } catch (err) {
      setPercentileModal({
        visible: true,
        loading: false,
        data: null,
        error: `获取 ${name}(${code}) 的历史分位数据失败`,
      });
    }
  };

  const closePercentileModal = () => {
    setPercentileModal({ visible: false, loading: false, data: null, error: null });
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
              <option value="200">200</option>
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
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50 shadow-lg">操作</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stocks.map((stock, index) => (
            <tr key={stock.code} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-mono font-bold text-blue-600">{(pagination.page - 1) * pagination.pageSize + index + 1}</span>
              </td>
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
                <span className={`font-medium ${parseFloat(stock.dividendYield) > 5 ? 'text-green-600' : parseFloat(stock.dividendYield) > 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {stock.dividendYield}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`font-medium ${(stock.eps || 0) > 1 ? 'text-green-600' : (stock.eps || 0) > 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {stock.eps ? stock.eps.toFixed(3) : 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`font-medium ${(stock.dividendPayRatio || 0) > 50 ? 'text-green-600' : (stock.dividendPayRatio || 0) > 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {stock.dividendPayRatio ? `${stock.dividendPayRatio.toFixed(1)}%` : 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`font-medium ${(stock.predictDividendRatio || 0) > 0.05 ? 'text-green-600' : (stock.predictDividendRatio || 0) > 0.03 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {stock.predictDividendRatio ? `${(stock.predictDividendRatio * 100).toFixed(2)}%` : 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-gray-900">{stock.volume}</span>
              </td>
              <td className="px-4 py-4 whitespace-nowrap sticky right-0 bg-white shadow-lg">
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleViewStock(stock.code, stock.name)}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 whitespace-nowrap"
                  >
                    查看
                  </button>
                  <button
                    onClick={() => handleViewPercentile(stock.code, stock.name)}
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 whitespace-nowrap"
                  >
                    历史分位
                  </button>
                </div>
              </td>
            </tr>
          ))}
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
      
      {/* 历史百分位弹窗 */}
      {percentileModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                历史分位
                {percentileModal.data && (
                  <span className="ml-2 text-base font-normal text-gray-500">
                    {percentileModal.data.codeName}({percentileModal.data.code}) - {percentileModal.data.date}
                  </span>
                )}
              </h3>
              <button
                onClick={closePercentileModal}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6">
              {percentileModal.loading && (
                <div className="flex justify-center items-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                  <span className="ml-3 text-gray-600">正在获取历史分位数据...</span>
                </div>
              )}

              {percentileModal.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {percentileModal.error}
                </div>
              )}

              {percentileModal.data && !percentileModal.loading && (
                <div>
                  {/* 当前值概览 */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-500">收盘价</div>
                      <div className="text-2xl font-bold text-blue-700">
                        {percentileModal.data.close?.toFixed(2) ?? 'N/A'}
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-500">PE(TTM)</div>
                      <div className="text-2xl font-bold text-green-700">
                        {percentileModal.data.pe?.toFixed(2) ?? 'N/A'}
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-500">PB(MRQ)</div>
                      <div className="text-2xl font-bold text-orange-700">
                        {percentileModal.data.pb?.toFixed(2) ?? 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* 参考日期收盘价对比 */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`rounded-lg p-4 text-center border-2 ${
                      percentileModal.data.close_lower_than_20240924 === true
                        ? 'bg-red-50 border-red-300'
                        : percentileModal.data.close_lower_than_20240924 === false
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-sm text-gray-500">2024-09-24 收盘价</div>
                      <div className="text-xl font-bold text-gray-800">
                        {percentileModal.data.close_20240924?.toFixed(2) ?? 'N/A'}
                      </div>
                      {percentileModal.data.close_lower_than_20240924 === true && (
                        <div className="mt-1 text-sm font-medium text-red-600">⬇ 低于彼时</div>
                      )}
                      {percentileModal.data.close_lower_than_20240924 === false && (
                        <div className="mt-1 text-sm font-medium text-green-600">⬆ 高于彼时</div>
                      )}
                      {percentileModal.data.close_lower_than_20240924 === null && (
                        <div className="mt-1 text-sm text-gray-400">无比较</div>
                      )}
                    </div>
                    <div className={`rounded-lg p-4 text-center border-2 ${
                      percentileModal.data.close_lower_than_20250407 === true
                        ? 'bg-red-50 border-red-300'
                        : percentileModal.data.close_lower_than_20250407 === false
                        ? 'bg-green-50 border-green-300'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="text-sm text-gray-500">2025-04-07 收盘价</div>
                      <div className="text-xl font-bold text-gray-800">
                        {percentileModal.data.close_20250407?.toFixed(2) ?? 'N/A'}
                      </div>
                      {percentileModal.data.close_lower_than_20250407 === true && (
                        <div className="mt-1 text-sm font-medium text-red-600">⬇ 低于彼时</div>
                      )}
                      {percentileModal.data.close_lower_than_20250407 === false && (
                        <div className="mt-1 text-sm font-medium text-green-600">⬆ 高于彼时</div>
                      )}
                      {percentileModal.data.close_lower_than_20250407 === null && (
                        <div className="mt-1 text-sm text-gray-400">无比较</div>
                      )}
                    </div>
                  </div>

                  {/* 百分位表格 */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">指标</th>
                          {percentileModal.data.percentiles.map((p) => (
                            <th key={p.period} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                              {p.period}
                              <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                                {p.count}条
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr className="hover:bg-blue-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">收盘价百分位</td>
                          {percentileModal.data.percentiles.map((p) => (
                            <td key={`close-${p.period}`} className="px-4 py-3 text-center">
                              <PercentileBadge value={p.closePercentile} />
                            </td>
                          ))}
                        </tr>
                        <tr className="hover:bg-green-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">PE百分位</td>
                          {percentileModal.data.percentiles.map((p) => (
                            <td key={`pe-${p.period}`} className="px-4 py-3 text-center">
                              <PercentileBadge value={p.pePercentile} />
                            </td>
                          ))}
                        </tr>
                        <tr className="hover:bg-orange-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">PB百分位</td>
                          {percentileModal.data.percentiles.map((p) => (
                            <td key={`pb-${p.period}`} className="px-4 py-3 text-center">
                              <PercentileBadge value={p.pbPercentile} />
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* 数据范围说明 */}
                  <div className="mt-4 text-xs text-gray-400 space-y-1">
                    {percentileModal.data.percentiles.map((p) => (
                      <div key={`range-${p.period}`}>
                        {p.period}：{p.actualStartDate} ~ {percentileModal.data?.date}（共 {p.count} 个交易日）
                      </div>
                    ))}
                    <div className="mt-1">
                      百分位 = 当前值在历史数据中排在什么位置（值越小表示越低于历史水平）
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        <p>数据来源：本地数据库，最后更新：{new Date().toLocaleDateString('zh-CN')}</p>
      </div>
    </div>
  );
};

/** 百分位徽章组件 */
function PercentileBadge({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return <span className="text-gray-400">N/A</span>;
  }

  let colorClass: string;
  if (value <= 20) {
    colorClass = 'bg-green-100 text-green-800';
  } else if (value <= 40) {
    colorClass = 'bg-blue-100 text-blue-800';
  } else if (value <= 60) {
    colorClass = 'bg-yellow-100 text-yellow-800';
  } else if (value <= 80) {
    colorClass = 'bg-orange-100 text-orange-800';
  } else {
    colorClass = 'bg-red-100 text-red-800';
  }

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${colorClass}`}>
      {value.toFixed(1)}%
    </span>
  );
}

export default StockTable;