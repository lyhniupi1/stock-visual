'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPortfolio, PortfolioStock } from '@/lib/api';

export default function CreatePortfolioPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [createdAt, setCreatedAt] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [stocks, setStocks] = useState<PortfolioStock[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // 添加股票
  const addStock = () => {
    setStocks([...stocks, { code: '', name: '', quantity: 0, costPrice: 0 }]);
  };

  // 删除股票
  const removeStock = (index: number) => {
    setStocks(stocks.filter((_, i) => i !== index));
  };

  // 更新股票信息
  const updateStock = (index: number, field: keyof PortfolioStock, value: string | number) => {
    const newStocks = [...stocks];
    newStocks[index] = { ...newStocks[index], [field]: value };
    setStocks(newStocks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('请输入组合名称');
      return;
    }

    // 过滤掉未填写的股票
    const validStocks = stocks.filter(s => s.code && s.name && s.quantity > 0 && s.costPrice > 0);

    try {
      setSubmitting(true);
      await createPortfolio({
        name: name.trim(),
        stocks: validStocks,
        createdAt,
      });
      router.push('/portfolios');
    } catch (error) {
      alert('创建组合失败');
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-4">
        <Link
          href="/portfolios"
          className="text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← 返回
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">创建新组合</h1>
      </div>

      {/* 表单 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        {/* 组合名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            组合名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：价值投资组合"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* 建仓时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            建仓时间
          </label>
          <input
            type="date"
            value={createdAt}
            onChange={(e) => setCreatedAt(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 持仓股票 */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              持仓股票
            </label>
            <button
              type="button"
              onClick={addStock}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
            >
              + 添加股票
            </button>
          </div>

          {stocks.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">暂无持仓股票</p>
              <p className="text-sm text-gray-400 mt-1">点击上方按钮添加</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stocks.map((stock, index) => (
                <div key={index} className="grid grid-cols-5 gap-4 items-end bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">股票代码</label>
                    <input
                      type="text"
                      value={stock.code}
                      onChange={(e) => updateStock(index, 'code', e.target.value)}
                      placeholder="sh600000"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">股票名称</label>
                    <input
                      type="text"
                      value={stock.name}
                      onChange={(e) => updateStock(index, 'name', e.target.value)}
                      placeholder="浦发银行"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">持仓数量</label>
                    <input
                      type="number"
                      value={stock.quantity || ''}
                      onChange={(e) => updateStock(index, 'quantity', parseInt(e.target.value) || 0)}
                      placeholder="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">成本价</label>
                    <input
                      type="number"
                      step="0.01"
                      value={stock.costPrice || ''}
                      onChange={(e) => updateStock(index, 'costPrice', parseFloat(e.target.value) || 0)}
                      placeholder="10.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => removeStock(index)}
                      className="w-full px-3 py-2 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="flex gap-4 pt-4">
          <Link
            href="/portfolios"
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
          >
            取消
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? '创建中...' : '创建组合'}
          </button>
        </div>
      </form>
    </div>
  );
}
