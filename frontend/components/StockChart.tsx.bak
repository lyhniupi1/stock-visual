'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchStockHistory, StockData } from '@/lib/api';

interface StockChartProps {
  stockCode: string;
  stockName?: string;
  limit?: number;
}

const StockChart = ({ stockCode, stockName = '', limit = 365 }: StockChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStockData = async () => {
      try {
        setLoading(true);
        const data = await fetchStockHistory(stockCode, limit);
        setStockData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load stock data:', err);
        setError('无法加载股票历史数据');
        // 使用模拟数据作为后备
        setStockData(generateMockData());
      } finally {
        setLoading(false);
      }
    };

    loadStockData();
  }, [stockCode, limit]);

  useEffect(() => {
    if (!chartContainerRef.current || stockData.length === 0) return;

    const createChart = () => {
      const container = chartContainerRef.current;
      if (!container) return;

      // 清除现有内容
      container.innerHTML = '';

      // 创建Canvas
      const canvas = document.createElement('canvas');
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 绘制背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (stockData.length === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.fillText('无数据可用', canvas.width / 2 - 40, canvas.height / 2);
        return;
      }

      // 准备K线数据
      const klineData = stockData.map(item => ({
        date: item.date,
        open: item.open || 0,
        close: item.close || 0,
        high: item.high || 0,
        low: item.low || 0,
        volume: item.volume || 0,
      }));

      // 计算价格范围
      const prices = klineData.flatMap(d => [d.open, d.close, d.high, d.low]).filter(p => p > 0);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      const priceRange = maxPrice - minPrice;

      // 图表区域边距
      const margin = { top: 60, right: 40, bottom: 60, left: 60 };
      const chartWidth = canvas.width - margin.left - margin.right;
      const chartHeight = canvas.height - margin.top - margin.bottom;

      // 绘制网格
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;

      // 垂直网格线
      const verticalLines = 10;
      for (let i = 0; i <= verticalLines; i++) {
        const x = margin.left + (chartWidth / verticalLines) * i;
        ctx.beginPath();
        ctx.moveTo(x, margin.top);
        ctx.lineTo(x, margin.top + chartHeight);
        ctx.stroke();
      }

      // 水平网格线
      const horizontalLines = 8;
      for (let i = 0; i <= horizontalLines; i++) {
        const y = margin.top + (chartHeight / horizontalLines) * i;
        ctx.beginPath();
        ctx.moveTo(margin.left, y);
        ctx.lineTo(margin.left + chartWidth, y);
        ctx.stroke();
      }

      // 绘制Y轴价格标签
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.textAlign = 'right';
      for (let i = 0; i <= horizontalLines; i++) {
        const price = maxPrice - (priceRange / horizontalLines) * i;
        const y = margin.top + (chartHeight / horizontalLines) * i;
        ctx.fillText(price.toFixed(2), margin.left - 10, y + 4);
      }

      // 绘制K线
      const barWidth = Math.min(20, chartWidth / klineData.length - 2);
      const spacing = 2;

      klineData.forEach((bar, index) => {
        const x = margin.left + index * (barWidth + spacing) + barWidth / 2;
        
        // 计算Y坐标
        const scaleY = (price: number) => 
          margin.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

        const openY = scaleY(bar.open);
        const closeY = scaleY(bar.close);
        const highY = scaleY(bar.high);
        const lowY = scaleY(bar.low);

        const isUp = bar.close >= bar.open;

        // 绘制上下影线
        ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();

        // 绘制实体
        ctx.fillStyle = isUp ? '#10b981' : '#ef4444';
        const entityTop = Math.min(openY, closeY);
        const entityHeight = Math.abs(closeY - openY);
        ctx.fillRect(x - barWidth / 2, entityTop, barWidth, Math.max(entityHeight, 1));
      });

      // 绘制标题
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      const displayName = stockName || stockCode;
      ctx.fillText(`${displayName} K线日线图`, margin.left, 30);

      // 绘制图例
      ctx.fillStyle = '#10b981';
      ctx.fillRect(canvas.width - 150, 20, 15, 15);
      ctx.fillStyle = '#374151';
      ctx.font = '12px Arial';
      ctx.fillText('上涨', canvas.width - 130, 32);

      ctx.fillStyle = '#ef4444';
      ctx.fillRect(canvas.width - 150, 45, 15, 15);
      ctx.fillStyle = '#374151';
      ctx.fillText('下跌', canvas.width - 130, 57);

      // 绘制X轴日期标签
      ctx.fillStyle = '#666';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      
      // 显示部分日期标签（避免重叠）
      const labelInterval = Math.max(1, Math.floor(klineData.length / 10));
      for (let i = 0; i < klineData.length; i += labelInterval) {
        const bar = klineData[i];
        const x = margin.left + i * (barWidth + spacing) + barWidth / 2;
        const dateStr = formatDate(bar.date);
        ctx.fillText(dateStr, x, margin.top + chartHeight + 20);
      }

      // 绘制最后价格
      if (klineData.length > 0) {
        const lastBar = klineData[klineData.length - 1];
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`最新价: ${lastBar.close.toFixed(2)}`, margin.left, margin.top + chartHeight + 40);
        ctx.fillText(`日期: ${formatDate(lastBar.date)}`, margin.left, margin.top + chartHeight + 60);
      }
    };

    createChart();

    // 处理窗口大小变化
    const handleResize = () => {
      createChart();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [stockData, stockCode, stockName]);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    } catch {
      return dateStr;
    }
  };

  // 生成模拟数据（后备）
  const generateMockData = (): StockData[] => {
    const mockData: StockData[] = [];
    let basePrice = 100;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (30 - i));
      
      const open = basePrice + (Math.random() - 0.5) * 10;
      const close = open + (Math.random() - 0.5) * 8;
      const high = Math.max(open, close) + Math.random() * 5;
      const low = Math.min(open, close) - Math.random() * 5;
      
      mockData.push({
        code: stockCode,
        date: date.toISOString().split('T')[0],
        codeName: stockName,
        open,
        high,
        low,
        close,
        preclose: basePrice,
        volume: Math.floor(Math.random() * 1000000),
        amount: Math.floor(Math.random() * 10000000),
        adjustflag: 1,
        turn: Math.random() * 5,
        tradestatus: 1,
        pctChg: ((close - open) / open) * 100,
        peTTM: Math.random() * 30,
        pbMRQ: Math.random() * 5,
        psTTM: Math.random() * 10,
        pcfNcfTTM: Math.random() * 20,
        isST: 0,
      });
      
      basePrice = close;
    }
    
    return mockData;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">正在加载股票K线数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-bold text-red-800">数据加载失败</h3>
          <p className="text-red-700">{error}</p>
          <p className="text-red-700 mt-2">显示模拟数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-96" />
      <div className="mt-4 text-sm text-gray-500">
        <p>数据来源：本地数据库，股票代码：{stockCode}，共 {stockData.length} 个交易日数据</p>
        <p className="mt-1">绿色表示上涨（收盘价≥开盘价），红色表示下跌（收盘价＜开盘价）</p>
      </div>
    </div>
  );
};

export default StockChart;