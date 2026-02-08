const StockTable = () => {
  const stocks = [
    { code: '000001', name: '平安银行', price: 10.25, change: '+2.5%', pe: 8.5, pb: 0.9, volume: '1.2亿' },
    { code: '000002', name: '万科A', price: 8.76, change: '-1.2%', pe: 6.3, pb: 0.7, volume: '0.8亿' },
    { code: '000858', name: '五粮液', price: 145.60, change: '+3.8%', pe: 25.4, pb: 5.2, volume: '2.1亿' },
    { code: '600519', name: '贵州茅台', price: 1680.50, change: '+1.5%', pe: 32.1, pb: 8.7, volume: '0.5亿' },
    { code: '300750', name: '宁德时代', price: 185.30, change: '-0.8%', pe: 18.9, pb: 3.4, volume: '3.2亿' },
    { code: '002415', name: '海康威视', price: 32.45, change: '+0.9%', pe: 15.2, pb: 2.1, volume: '1.8亿' },
  ];

  return (
    <div className="overflow-x-auto">
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
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stock.change}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-gray-900">{stock.pe}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-gray-900">{stock.pb}</span>
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
    </div>
  );
};

export default StockTable;