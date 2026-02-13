'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Stock {
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
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 加载所有股票列表（只加载一次）
  useEffect(() => {
    const loadStocks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/stocks/codes');
        if (response.ok) {
          const data = await response.json();
          setStocks(data);
        }
      } catch (error) {
        console.error('Failed to load stocks:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStocks();
  }, []);

  // 过滤股票
  useEffect(() => {
    if (!query.trim()) {
      setFilteredStocks([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = stocks
      .filter(
        (stock) =>
          stock.code.toLowerCase().includes(lowerQuery) ||
          stock.codeName.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 50); // 限制显示数量

    setFilteredStocks(filtered);
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

  const handleSelect = useCallback(
    (stock: Stock) => {
      setQuery(`${stock.code} - ${stock.codeName}`);
      onSelect(stock);
      setIsOpen(false);
    },
    [onSelect]
  );

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
    if (query && filteredStocks.length === 0) {
      // 重新过滤当前查询
      const lowerQuery = query.toLowerCase();
      const filtered = stocks
        .filter(
          (stock) =>
            stock.code.toLowerCase().includes(lowerQuery) ||
            stock.codeName.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 50);
      setFilteredStocks(filtered);
    }
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

      {loading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

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
