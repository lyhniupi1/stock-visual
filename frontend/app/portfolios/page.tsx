import Link from 'next/link';
import PortfolioList from '@/components/PortfolioList';

export default function PortfoliosPage() {
  return (
    <div className="space-y-8">
      {/* 标题和简介 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          我的股票组合
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          管理您的股票投资组合，查看持仓情况、盈亏分析和历史表现。
        </p>
      </div>

      {/* 操作栏 */}
      <div className="flex justify-between items-center">
        <div className="text-gray-600">
          <span className="text-sm">点击"查看明细"了解组合详情</span>
        </div>
        <Link
          href="/portfolios/create"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md"
        >
          + 创建新组合
        </Link>
      </div>

      {/* 组合列表 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">组合列表</h2>
        <PortfolioList />
      </div>

      {/* 说明区域 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-3">功能说明</h3>
        <ul className="list-disc pl-5 text-blue-700 space-y-2">
          <li>创建股票组合，记录持仓股票和建仓成本</li>
          <li>实时计算组合市值和盈亏情况</li>
          <li>点击"查看明细"查看组合持仓详情和历史走势</li>
          <li>盈亏百分比基于最新市场价格和建仓成本计算</li>
        </ul>
      </div>
    </div>
  );
}
