import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              股票数据可视化
            </Link>
            <div className="ml-10 flex space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                首页
              </Link>
              <Link href="/stocks" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                股票列表
              </Link>
              <Link href="/portfolios" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                我的组合
              </Link>
              <Link href="/charts" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                K线图
              </Link>
              <Link href="/valuation" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                估值分析
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                关于
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索股票代码..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">
                🔍
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;