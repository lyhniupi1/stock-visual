'use client';

import { useState, useEffect, useRef, useMemo } from 'react';

export interface Stock {
  code: string;
  codeName: string;
}

interface StockSearchSelectProps {
  value: string;
  onSelect: (stock: Stock) => void;
  stocks: Stock[]; // 从父组件传入股票列表
  placeholder?: string;
}

export default function StockSearchSelect({
  value,
  onSelect,
  stocks,
  placeholder = '搜索股票代码或名称...',
}: StockSearchSelectProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 过滤股票 - 使用 useMemo 避免重复计算
  const filteredStocks = useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const lowerQuery = query.toLowerCase();
    return stocks
      .filter(
        (stock) =>
          stock.code.toLowerCase().includes(lowerQuery) ||
          stock.codeName.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 50); // 限制显示数量
  }, [query, stocks]);

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 设置初始值
  useEffect(() => {
    if (value && stocks.length > 0) {
      const stock = stocks.find((s) => s.code === value);
      if (stock && !query) {
        setQuery(`${stock.code} - ${stock.codeName}`);
      }
    }
  }, [value, stocks, query]);

  const handleSelect = (stock: Stock) => {
    setQuery(`${stock.code} - ${stock.codeName}`);
    onSelect(stock);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setIsOpen(true);

    // 如果清空了输入，也清空选择
    if (!newValue.trim()) {
      onSelect({ code: '', codeName: '' });
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        autoComplete="off"
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
        >
          {filteredStocks.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {query ? '未找到匹配的股票' : '输入股票代码或名称搜索'}
            </div>
          ) : (
            filteredStocks.map((stock) => (
              <button
                key={stock.code}
                type="button"
                onClick={() => handleSelect(stock)}
                className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none text-sm border-b border-gray-100 last:border-b-0"
              >
                <span className="font-medium text-gray-900">{stock.code}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="text-gray-700">{stock.codeName}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
