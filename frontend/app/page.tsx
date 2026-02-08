import StockChart from "@/components/StockChart";
import StockTable from "@/components/StockTable";
import StatsCard from "@/components/StatsCard";

export default function Home() {
  return (
    <div className="space-y-8">
      {/* 标题和简介 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          股票数据可视化平台
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          基于Next.js 14和NestJS构建的专业股票数据可视化工具，提供K线图、PE/PB估值分析、历史数据查询等功能。
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="股票数量"
          value="8,000+"
          description="A股市场股票"
          icon="📈"
          color="blue"
        />
        <StatsCard
          title="数据时间"
          value="10年+"
          description="历史数据覆盖"
          icon="📅"
          color="green"
        />
        <StatsCard
          title="更新频率"
          value="每日"
          description="数据实时更新"
          icon="⚡"
          color="yellow"
        />
        <StatsCard
          title="数据库大小"
          value="676MB"
          description="SQLite数据库"
          icon="💾"
          color="purple"
        />
      </div>

      {/* 图表展示区域 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">K线图示例</h2>
        <div className="h-96">
          <StockChart />
        </div>
      </div>

      {/* 功能特性 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="text-3xl mb-4">📊</div>
          <h3 className="text-xl font-bold mb-2">专业K线图</h3>
          <p className="text-gray-600">
            使用Lightweight Charts实现专业级K线图展示，支持缩放、拖拽、十字光标等交互功能。
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="text-3xl mb-4">📈</div>
          <h3 className="text-xl font-bold mb-2">PE/PB估值分析</h3>
          <p className="text-gray-600">
            提供历史PE/PB曲线图，帮助分析股票估值水平，识别投资机会。
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="text-3xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">数据查询</h3>
          <p className="text-gray-600">
            支持按股票代码、时间范围查询历史数据，快速获取所需信息。
          </p>
        </div>
      </div>

      {/* 股票数据表格 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">最新股票数据</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            查看更多
          </button>
        </div>
        <StockTable />
      </div>

      {/* 技术栈展示 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">技术栈</h2>
        <div className="flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <div className="text-4xl mb-2">⚛️</div>
            <p className="font-semibold">Next.js 14</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🦅</div>
            <p className="font-semibold">NestJS</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🗄️</div>
            <p className="font-semibold">SQLite3</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="font-semibold">Lightweight Charts</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🎨</div>
            <p className="font-semibold">Tailwind CSS</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">🔄</div>
            <p className="font-semibold">TypeORM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
