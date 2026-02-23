import IndexValuationChart from "@/components/IndexValuationChart";

export default function ValuationPage() {
  return (
    <div className="space-y-8">
      {/* 标题和简介 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          指数估值分析
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          查看主要指数的历史估值数据，包括市盈率(PE)、市净率(PB)和净资产收益率(ROE)随时间的变化趋势。
        </p>
      </div>

      {/* 图表区域 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">指数估值趋势</h2>
        <p className="text-gray-600 mb-6">
          以下图表展示了主要指数的历史估值数据。您可以选择不同的指数和时间范围进行分析。
        </p>
        <IndexValuationChart />
      </div>

      {/* 说明区域 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-3">如何使用</h3>
        <ul className="list-disc pl-5 text-blue-700 space-y-2">
          <li>图表展示了PE（市盈率）、PB（市净率）和ROE（净资产收益率）三个关键估值指标</li>
          <li>使用图表上方的下拉菜单可以选择不同的指数进行分析</li>
          <li>鼠标悬停在图表上可以查看具体日期的详细数值</li>
          <li>图表支持缩放和平移，方便查看特定时间段的详细数据</li>
          <li>数据每日更新，确保您看到的是最新市场估值信息</li>
        </ul>
      </div>

      {/* 估值指标解释 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-green-800 mb-3">市盈率 (PE)</h3>
          <p className="text-green-700">
            市盈率是股票价格与每股收益的比率，反映了投资者为每单位盈利支付的价格。
            较低的PE可能表示股票被低估，较高的PE可能表示被高估或市场对其未来增长有较高预期。
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-3">市净率 (PB)</h3>
          <p className="text-yellow-700">
            市净率是股票价格与每股净资产的比率，反映了股票价格相对于其账面价值的高低。
            PB小于1可能表示股票价格低于其净资产价值，理论上存在投资机会。
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-800 mb-3">净资产收益率 (ROE)</h3>
          <p className="text-purple-700">
            净资产收益率是净利润与净资产的比率，反映了公司利用股东资本创造利润的效率。
            较高的ROE通常表示公司具有较强的盈利能力和资本使用效率。
          </p>
        </div>
      </div>
    </div>
  );
}