import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    // 只放「不会打断功能」的头部。完整 CSP 在这里给不出有效保护：
    // Monaco 由 @monaco-editor/react 在运行时从 CDN 拉、题解执行器与 tracer 依赖
    // new Function，能跑通的 CSP 必然同时放行 unsafe-eval + unsafe-inline + 外部 script-src，
    // 那等于没有 script-src。真正的隔离要给执行器换一个独立源（见 docs/DEPLOYMENT.md §7）。
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
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
