import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PortfolioDetailPage({ params }: PageProps) {
  const { id } = await params;

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
          <h1 className="text-3xl font-bold text-gray-900">组合详情</h1>
        </div>
      </div>

      {/* 占位内容 */}
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          组合明细页面
        </h2>
        <p className="text-gray-600 mb-6">
          组合 ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span>
        </p>
        <p className="text-gray-500 mb-8 max-w-lg mx-auto">
          该页面功能待定，后续将实现：持仓详情、盈亏分析、历史走势等功能。
        </p>
        <Link
          href="/portfolios"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          返回组合列表
        </Link>
      </div>

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
