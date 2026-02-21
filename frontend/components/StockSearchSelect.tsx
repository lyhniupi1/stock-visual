'use client';

import { useState, useEffect, useRef } from 'react';
import { searchStocks } from '@/lib/api';

export interface Stock {
  code: string;
  codeName: string;
}

interface StockSearchSelectProps {
  value: string;
  onSelect: (stock: Stock) => void;
  placeholder?: string;
}

export default function StockSearchSelect({
  value,
  onSelect,
  placeholder = '搜索股票代码或名称...',
}: StockSearchSelectProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 搜索股票
  useEffect(() => {
    if (!query.trim()) {
      setFilteredStocks([]);
      return;
    }

    // 清除之前的定时器
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 设置防抖（300ms）
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await searchStocks(query, 20);
        setFilteredStocks(results);
      } catch (error) {
        console.error('搜索股票失败:', error);
        setFilteredStocks([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

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

  // 设置初始值（如果value是股票代码，需要显示对应的名称）
  useEffect(() => {
    if (value && !query) {
      // 这里可以添加逻辑：如果value是股票代码，可以尝试获取股票名称
      // 暂时只显示代码
      setQuery(value);
    }
  }, [value, query]);

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
      setFilteredStocks([]);
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
          {isLoading ? (
            <div className="px-3 py-2 text-gray-500 text-sm flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 mr-2 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              搜索中...
            </div>
          ) : filteredStocks.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-sm">
              {query.trim() ? '未找到匹配的股票' : '输入股票代码或名称搜索'}
            </div>
          ) : (
            filteredStocks.map((stock, index) => (
              <button
                key={`${stock.code}-${stock.codeName}-${index}`}
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
