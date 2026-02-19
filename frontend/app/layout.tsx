import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "股票数据可视化",
  description: "基于Next.js和NestJS的股票数据可视化工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 antialiased`}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 w-full">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
              {children}
            </div>
          </main>
          <footer className="bg-white border-t">
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
              <div className="text-center text-gray-600 text-sm sm:text-base">
                <p className="mb-2">股票数据可视化项目 © 2026 - 基于Next.js 14 + NestJS + SQLite3</p>
                <p className="text-xs sm:text-sm text-gray-500">支持PC、平板和手机端访问</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
