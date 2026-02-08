'use client';

import { useEffect, useRef } from 'react';

const StockChart = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // 模拟图表数据
    const createChart = () => {
      const container = chartContainerRef.current;
      if (!container) return;

      // 清除现有内容
      container.innerHTML = '';

      // 创建模拟图表
      const canvas = document.createElement('canvas');
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      container.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 绘制背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 绘制网格
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;

      // 垂直网格线
      for (let i = 0; i <= 10; i++) {
        const x = (canvas.width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // 水平网格线
      for (let i = 0; i <= 10; i++) {
        const y = (canvas.height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 模拟K线数据
      const data = [
        { open: 100, close: 105, high: 108, low: 98 },
        { open: 105, close: 102, high: 107, low: 101 },
        { open: 102, close: 108, high: 110, low: 100 },
        { open: 108, close: 112, high: 115, low: 107 },
        { open: 112, close: 110, high: 114, low: 108 },
        { open: 110, close: 115, high: 118, low: 109 },
        { open: 115, close: 118, high: 120, low: 113 },
      ];

      const barWidth = 30;
      const spacing = 10;
      const startX = 50;
      const maxPrice = 120;
      const minPrice = 98;

      // 绘制K线
      data.forEach((bar, index) => {
        const x = startX + index * (barWidth + spacing);
        const isUp = bar.close >= bar.open;

        // 计算Y坐标
        const scaleY = (price: number) => 
          canvas.height - 50 - ((price - minPrice) / (maxPrice - minPrice)) * (canvas.height - 100);

        const openY = scaleY(bar.open);
        const closeY = scaleY(bar.close);
        const highY = scaleY(bar.high);
        const lowY = scaleY(bar.low);

        // 绘制上下影线
        ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + barWidth / 2, highY);
        ctx.lineTo(x + barWidth / 2, lowY);
        ctx.stroke();

        // 绘制实体
        ctx.fillStyle = isUp ? '#10b981' : '#ef4444';
        const entityTop = Math.min(openY, closeY);
        const entityHeight = Math.abs(closeY - openY);
        ctx.fillRect(x, entityTop, barWidth, Math.max(entityHeight, 2));
      });

      // 绘制标题
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('股票K线图示例 (000001.SZ)', 20, 30);

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
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={chartContainerRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 text-sm text-gray-500">
        注：这是一个模拟图表，实际将使用Lightweight Charts库
      </div>
    </div>
  );
};

export default StockChart;