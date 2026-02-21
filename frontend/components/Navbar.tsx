"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import StockSearchSelect, { Stock } from './StockSearchSelect';
import { fetchStockCodes } from '@/lib/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 获取股票代码列表
  useEffect(() => {
    const loadStockCodes = async () => {
      try {
        const stockCodes = await fetchStockCodes();
        setStocks(stockCodes);
      } catch (error) {
        console.error('Failed to load stock codes:', error);
      }
    };

    loadStockCodes();
  }, []);

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    // 当选择股票时，跳转到该股票的详情页面
    if (stock.code) {
      window.location.href = `/stocks/${stock.code}?name=${stock.codeName}`;
    }
  };

  const navLinks = [
    { href: "/", label: "首页" },
    { href: "/stocks", label: "股票列表" },
    { href: "/portfolios", label: "我的组合" },
    { href: "/charts", label: "K线图" },
    { href: "/valuation", label: "估值分析" },
    { href: "/about", label: "关于" },
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              股票数据可视化
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <div className="flex space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Stock Search Select */}
            <div className="ml-6 w-48 lg:w-64">
              <StockSearchSelect
                value={selectedStock?.code || ''}
                onSelect={handleStockSelect}
                stocks={stocks}
                placeholder="搜索股票代码或名称..."
              />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <div className="w-32">
              <StockSearchSelect
                value={selectedStock?.code || ''}
                onSelect={handleStockSelect}
                stocks={stocks}
                placeholder="搜索股票..."
              />
            </div>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">打开主菜单</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;