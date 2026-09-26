import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    // 兜底值必须是宿主机可达的地址：生产由 docker-compose 显式注入 http://backend:40001，
    // 而本地开发若不设 NEXT_PUBLIC_API_URL，用 compose 服务名会让所有 API 调用静默失败。
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:40001';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${apiBase}/:path*`,
      },
    ];
  },
};

export default nextConfig;
