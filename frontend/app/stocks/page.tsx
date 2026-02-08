import StockTable from "@/components/StockTable";
import StatsCard from "@/components/StatsCard";

export default function StocksPage() {
  return (
    <div className="space-y-8">
      {/* 标题和简介 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          股票列表
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          查看所有股票的实时数据，包括代码、名称、最新价格、PE/PB比率等。
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="股票总数"
          value="8,000+"
          description="A股市场股票"
          icon="📈"
          color="blue"
        />
        <StatsCard
          title="平均PE"
          value="15.2"
          description="市场平均市盈率"
          icon="💰"
          color="green"
        />
        <StatsCard
          title="平均PB"
          value="1.8"
          description="市场平均市净率"
          icon="📊"
          color="yellow"
        />
        <StatsCard
          title="今日更新"
          value="2025-01-15"
          description="最新数据日期"
          icon="📅"
          color="purple"
        />
      </div>

      {/* 股票表格 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">股票数据表</h2>
        <p className="text-gray-600 mb-6">
          以下表格展示了从数据库获取的股票数据。您可以点击行查看详细分析。
        </p>
        <StockTable />
      </div>

      {/* 说明区域 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-3">如何使用</h3>
        <ul className="list-disc pl-5 text-blue-700 space-y-2">
          <li>点击股票代码可以查看该股票的详细K线图和估值分析</li>
          <li>使用表格上方的搜索框可以快速过滤股票</li>
          <li>表格支持按各列排序，点击列标题即可</li>
          <li>数据每日更新，确保您看到的是最新市场信息</li>
        </ul>
      </div>
    </div>
  );
}