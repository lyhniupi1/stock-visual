import PEChart from '@/components/PEChart';
import PBChart from '@/components/PBChart';
import { fetchStockCodes } from '@/lib/api';
import Link from 'next/link';

interface PEPBChartPageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PEPBChartPage({ params, searchParams }: PEPBChartPageProps) {
  const { code } = await params;
  const searchParamsObj = await searchParams;
  const stockName = typeof searchParamsObj.name === 'string' ? searchParamsObj.name : '';
  
  // 获取股票代码列表用于导航
  let stockCodes: { code: string; codeName: string }[] = [];
  try {
    stockCodes = await fetchStockCodes();
  } catch (error) {
    console.error('Failed to fetch stock codes:', error);
  }

  // 查找当前股票在列表中的位置
  const currentIndex = stockCodes.findIndex(stock => stock.code === code);
  const prevStock = currentIndex > 0 ? stockCodes[currentIndex - 1] : null;
  const nextStock = currentIndex < stockCodes.length - 1 ? stockCodes[currentIndex + 1] : null;

  // 获取当前股票的完整名称
  const currentStock = stockCodes.find(stock => stock.code === code);
  const displayName = stockName || currentStock?.codeName || code;

  return (
    <div className="space-y-8">
      {/* 导航栏 */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href={`/stocks/${code}${stockName ? `?name=${encodeURIComponent(stockName)}` : ''}`}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            返回股票详情
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {displayName} - PE/PB历史曲线
          </h1>
          <p className="text-gray-600 mt-1">
            股票代码: {code} | 独立展示市盈率(PE)和市净率(PB)的历史变化曲线
          </p>
        </div>

        {/* 相邻股票导航 */}
        <div className="flex space-x-4">
          {prevStock && (
            <Link
              href={`/stocks/${prevStock.code}/pepb-chart?name=${encodeURIComponent(prevStock.codeName)}`}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              {prevStock.code}
            </Link>
          )}
          {nextStock && (
            <Link
              href={`/stocks/${nextStock.code}/pepb-chart?name=${encodeURIComponent(nextStock.codeName)}`}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center"
            >
              {nextStock.code}
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          )}
        </div>
      </div>

      {/* 主要图表区域 - 两个独立图表 */}
      <div className="space-y-8">
        {/* PE图表 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <PEChart
            stockCode={code}
            stockName={displayName}
            limit={0} // 0表示获取全部数据
          />
        </div>

        {/* PB图表 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <PBChart
            stockCode={code}
            stockName={displayName}
            limit={0} // 0表示获取全部数据
          />
        </div>
      </div>

      {/* 说明卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">关于PE(TTM)</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• <span className="font-medium">PE(TTM)</span>：滚动市盈率，反映公司市值与最近12个月净利润的比率</li>
            <li>• <span className="font-medium">估值参考</span>：PE {'<'} 10（低估），10-20（合理），{'>'} 20（高估）</li>
            <li>• <span className="font-medium">适用行业</span>：盈利稳定的成熟行业（如消费、金融）</li>
            <li>• <span className="font-medium">注意事项</span>：不适用于亏损公司或周期性行业</li>
          </ul>
        </div>

        <div className="bg-green-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">关于PB(MRQ)</h3>
          <ul className="text-green-800 space-y-2">
            <li>• <span className="font-medium">PB(MRQ)</span>：市净率，反映公司市值与最近季度净资产的比率</li>
            <li>• <span className="font-medium">估值参考</span>：PB {'<'} 1.5（低估），1.5-3（合理），{'>'} 3（高估）</li>
            <li>• <span className="font-medium">适用行业</span>：资产密集型行业（如银行、房地产、制造业）</li>
            <li>• <span className="font-medium">注意事项</span>：不适用于轻资产或高无形资产公司</li>
          </ul>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex justify-center space-x-4">
        <Link
          href={`/stocks/${code}${stockName ? `?name=${encodeURIComponent(stockName)}` : ''}`}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
        >
          返回股票详情页
        </Link>
        <Link
          href="/stocks"
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
        >
          浏览所有股票
        </Link>
      </div>
    </div>
  );
}