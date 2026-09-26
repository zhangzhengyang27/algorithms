'use client';

import { useEffect } from 'react';

/**
 * 根级错误边界（app/global-error.tsx）
 * 必须自行提供 <html>/<body>，因为根布局可能已崩溃。
 * 使用内联样式而非主题 token，避免依赖全局 CSS。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('全局错误:', error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
          background: '#0f1115',
          color: '#e5e7eb',
        }}
      >
        <div style={{ textAlign: 'center', padding: '24px', maxWidth: '440px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 20px',
              borderRadius: '16px',
              background: 'rgba(239,68,68,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
            }}
          >
            ⚠️
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>
            应用遇到问题
          </h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 24px', lineHeight: 1.6 }}>
            应用初始化失败。请刷新重试。
            {error?.digest && (
              <span style={{ display: 'block', marginTop: '8px', fontSize: '11px', color: '#6b7280' }}>
                错误码：{error.digest}
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#4f46e5',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            重试
          </button>
        </div>
      </body>
    </html>
  );
}
