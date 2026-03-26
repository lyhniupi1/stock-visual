import EquityBondSpreadChart from "@/components/EquityBondSpreadChart";

export default function EquityBondSpreadPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 标题和简介 */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          股债利差分析
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          股债利差（也称为股权风险溢价）是衡量股票市场相对于债券市场估值吸引力的重要指标。
          通过分析沪深300指数的收盘价和股债利差变化趋势，帮助投资者判断市场估值水平。
        </p>
      </div>

      {/* 股债利差图表组件 */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <EquityBondSpreadChart />
      </div>

      {/* 指标解释 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-blue-800 mb-3">什么是股债利差？</h3>
          <p className="text-blue-700">
            股债利差（Equity Bond Spread）也称为股权风险溢价（Equity Risk Premium），
            计算公式为：1/市盈率(PE) - 10年期国债收益率。它反映了股票市场相对于债券市场的估值吸引力。
            当股债利差较高时，说明股票市场相对于债券市场更有投资价值；反之则债券市场更有吸引力。
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="text-xl font-bold text-green-800 mb-3">如何解读股债利差？</h3>
          <ul className="list-disc pl-5 text-green-700 space-y-2">
            <li><strong>股债利差 {'>'} 历史均值</strong>：股票市场相对低估，投资价值较高</li>
            <li><strong>股债利差 ≈ 历史均值</strong>：市场估值处于合理水平</li>
            <li><strong>股债利差 {'<'} 历史均值</strong>：股票市场相对高估，投资价值较低</li>
            <li><strong>股债利差 {'<'} 0</strong>：债券市场比股票市场更有吸引力</li>
          </ul>
        </div>
      </div>

      {/* 数据说明 */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">数据说明</h3>
        <div className="text-gray-700 space-y-3">
          <p>
            <strong>数据来源</strong>：本页面数据来源于 <code>data/magicFormulaData.db</code> 数据库中的 <code>equity_bond_spread</code> 表。
          </p>
          <p>
            <strong>指数选择</strong>：使用沪深300指数（代码：000300.SH）作为股票市场代表，因其覆盖A股市场约60%的市值，具有较好的代表性。
          </p>
          <p>
            <strong>债券收益率</strong>：使用10年期国债收益率作为无风险利率的代表。
          </p>
          <p>
            <strong>更新频率</strong>：数据每日更新，确保您看到的是最新市场信息。
          </p>
          <p>
            <strong>图表功能</strong>：
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>鼠标悬停在图表上可以查看具体日期的详细数值</li>
            <li>图表支持缩放和平移，方便查看特定时间段的详细数据</li>
            <li>左侧图表显示沪深300收盘价趋势，右侧图表显示股债利差趋势</li>
            <li>黄色虚线表示股债利差的历史均值</li>
          </ul>
        </div>
      </div>

      {/* 投资建议 */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-xl font-bold text-yellow-800 mb-3">重要提示</h3>
        <p className="text-yellow-700">
          股债利差是重要的市场估值参考指标，但不应作为唯一的投资决策依据。
          投资决策应综合考虑宏观经济环境、行业前景、公司基本面等多方面因素。
          市场有风险，投资需谨慎。
        </p>
      </div>
    </div>
  );
}