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
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gray-50`}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="bg-white border-t py-6">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>股票数据可视化项目 © 2026 - 基于Next.js 14 + NestJS + SQLite3</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
