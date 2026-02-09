import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async rewrites() {
    // 开发环境：代理到后端服务器防止跨域
    // 生产环境：由nginx代理，不需要重写（或保持相同配置）
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/api/:path*',
        },
      ];
    }
    // 生产环境可以返回空数组或保持相同配置（如果nginx已经配置）
    return [];
  },
};

export default nextConfig;
