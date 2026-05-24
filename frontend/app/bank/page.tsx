"use client";

import BankTable from '@/components/BankTable';

const BankValuationPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">银行估值分析</h1>
      <BankTable />
    </div>
  );
};

export default BankValuationPage;
