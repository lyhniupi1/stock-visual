import StockChart from "@/components/StockChart";
import StockTable from "@/components/StockTable";
import StatsCard from "@/components/StatsCard";

export default function Home() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 标题和简介 */}
      <div className="text-center px-2">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          股票数据可视化平台
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl md:max-w-3xl mx-auto px-2">
          基于Next.js 14和NestJS构建的专业股票数据可视化工具，提供K线图、PE/PB估值分析、历史数据查询等功能。
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">K线图示例</h2>
        <div className="h-64 sm:h-80 md:h-96">
          <StockChart stockCode="sh.000001" stockName="平安银行" />
        </div>
      </div>

      {/* 功能特性 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">📊</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">专业K线图</h3>
          <p className="text-sm sm:text-base text-gray-600">
            使用Lightweight Charts实现专业级K线图展示，支持缩放、拖拽、十字光标等交互功能。
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">📈</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">PE/PB估值分析</h3>
          <p className="text-sm sm:text-base text-gray-600">
            提供历史PE/PB曲线图，帮助分析股票估值水平，识别投资机会。
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md">
          <div className="text-2xl sm:text-3xl mb-3 sm:mb-4">🔍</div>
          <h3 className="text-lg sm:text-xl font-bold mb-2">数据查询</h3>
          <p className="text-sm sm:text-base text-gray-600">
            支持按股票代码、时间范围查询历史数据，快速获取所需信息。
          </p>
        </div>
      </div>

      {/* 股票数据表格 */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">最新股票数据</h2>
          <button className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto">
            查看更多
          </button>
        </div>
        <div className="overflow-x-auto">
          <StockTable />
        </div>
      </div>

      {/* 技术栈展示 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">技术栈</h2>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
          <div className="text-center min-w-[80px] sm:min-w-[100px]">
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">⚛️</div>
            <p className="font-semibold text-sm sm:text-base">Next.js 14</p>
          </div>
          <div className="text-center min-w-[80px] sm:min-w-[100px]">
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🦅</div>
            <p className="font-semibold text-sm sm:text-base">NestJS</p>
          </div>
          <div className="text-center min-w-[80px] sm:min-w-[100px]">
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🗄️</div>
            <p className="font-semibold text-sm sm:text-base">SQLite3</p>
          </div>
          <div className="text-center min-w-[80px] sm:min-w-[100px]">
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">📊</div>
            <p className="font-semibold text-sm sm:text-base">Lightweight Charts</p>
          </div>
          <div className="text-center min-w-[80px] sm:min-w-[100px]">
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🎨</div>
            <p className="font-semibold text-sm sm:text-base">Tailwind CSS</p>
          </div>
          <div className="text-center min-w-[80px] sm:min-w-[100px]">
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">🔄</div>
            <p className="font-semibold text-sm sm:text-base">TypeORM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
