import PortfolioValuationChart from "@/components/PortfolioValuationChart";

export default function PortfolioValuationPage() {
  return (
    <div className="space-y-8">
      {/* 标题和简介 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          组合估值分析
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          查看神奇公式组合回测的历史估值数据，包括PE中位数、PB中位数、PE×PB中位数、分红率和ROE中位数随时间的变化趋势。
        </p>
      </div>

      {/* 图表区域 */}
      <div className="space-y-6">
        <PortfolioValuationChart />
      </div>

      {/* 说明区域 */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-800 mb-3">指标说明</h3>
        <ul className="list-disc pl-5 text-blue-700 space-y-2">
          <li><strong>PE中位数</strong>：组合中所有股票市盈率（PE）的中位数，反映整体估值水平</li>
          <li><strong>PB中位数</strong>：组合中所有股票市净率（PB）的中位数，反映净资产溢价水平</li>
          <li><strong>PE×PB中位数</strong>：市盈率与市净率的乘积中位数，综合估值指标</li>
          <li><strong>分红率</strong>：组合中所有股票股息率的中位数，反映分红收益水平</li>
          <li><strong>ROE中位数</strong>：组合中所有股票净资产收益率的中位数，反映盈利能力</li>
        </ul>
      </div>

      {/* 估值指标解释 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-green-800 mb-3">PE中位数</h3>
          <p className="text-green-700">
            市盈率中位数反映了组合整体的估值水平。较低的PE中位数可能表示组合整体被低估，
            较高的PE中位数可能表示市场对组合有较高增长预期。
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-yellow-800 mb-3">PB中位数</h3>
          <p className="text-yellow-700">
            市净率中位数反映了组合相对于净资产的溢价水平。PB中位数较低可能表示组合中多为
            重资产或低估值股票，较高则可能表示轻资产或高估值股票较多。
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-purple-800 mb-3">ROE中位数</h3>
          <p className="text-purple-700">
            ROE中位数反映了组合整体的盈利能力。较高的ROE中位数表示组合中公司的资本回报效率较高，
            是衡量组合质量的重要指标。
          </p>
        </div>
      </div>
    </div>
  );
}
