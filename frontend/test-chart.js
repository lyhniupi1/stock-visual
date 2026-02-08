// 测试lightweight-charts API
const { createChart } = require('lightweight-charts');

console.log('Testing lightweight-charts API...');

// 检查createChart的返回值
const chart = createChart(document.createElement('div'), { width: 800, height: 600 });

console.log('Chart methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(chart)).filter(name => !name.startsWith('_')));
console.log('Chart properties:', Object.keys(chart));

// 检查是否有addCandlestickSeries方法
console.log('Has addCandlestickSeries?', typeof chart.addCandlestickSeries);
console.log('Has addSeries?', typeof chart.addSeries);