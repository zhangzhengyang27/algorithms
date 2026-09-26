'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, UserPlus, AlertCircle, ArrowLeft } from 'lucide-react';
import { AuthApi } from '@/lib/api-client';
import { useProgressStore } from '@/store';

type Mode = 'login' | 'register';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useProgressStore((s) => s.setAuth);
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo123');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fn = mode === 'login' ? AuthApi.login : AuthApi.register;
      const res = await fn(email.trim(), password, name.trim() || undefined);
      setAuth(res.user);
      // 真实进度数据由 ProgressBootstrap 在 user 变化后统一拉取，这里无需重复处理
      router.push('/progress');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : (() => {
              try {
                const parsed = JSON.parse(String(err));
                return Array.isArray(parsed.message) ? parsed.message.join(', ') : parsed.message;
              } catch {
                return String(err);
              }
            })();
      setError(message || '登录失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-56px)] grid lg:grid-cols-2">
      {/* ─── Left: brand panel ─── */}
      <div className="hidden lg:flex flex-col justify-between p-12 border-r border-edge bg-surface/50">
        <Link href="/" className="inline-flex items-center gap-2 text-ink-3 hover:text-ink transition-colors w-fit">
          <ArrowLeft size={15} />
          <span className="text-[13px]">返回首页</span>
        </Link>

        <div>
          <div className="font-mono text-xs text-brand tracking-widest uppercase mb-4">
            AlgoViz Platform
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight leading-tight mb-4">
            每一次登录，
            <br />
            都是向 AC 更近一步
          </h2>
          <p className="text-ink-3 text-sm leading-relaxed max-w-sm">
            同步你的学习进度，跨设备继续刷题之旅。
          </p>
        </div>

        <div className="flex gap-8">
          {[
            { value: '10', label: '可视化模块' },
            { value: '40+', label: '教程' },
            { value: '∞', label: '可能性' },
          ].map((s) => (
            <div key={s.label}>
              <div className="font-display text-lg font-bold">{s.value}</div>
              <div className="text-[10px] text-ink-3 font-mono">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Right: form ─── */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm anim-scale-in">
          {/* Mobile back link */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-ink-3 hover:text-ink transition-colors mb-8 text-[13px]">
            <ArrowLeft size={15} />
            返回首页
          </Link>

          <div className="flex items-center gap-3 mb-2">
            {mode === 'login' ? (
              <LogIn size={22} className="text-brand" />
            ) : (
              <UserPlus size={22} className="text-brand" />
            )}
            <h1 className="font-display text-2xl font-bold tracking-tight">
              {mode === 'login' ? '登录' : '注册账号'}
            </h1>
          </div>
          <p className="text-[13px] text-ink-3 mb-8">
            {mode === 'login'
              ? '使用 demo@example.com / demo123 体验'
              : '创建账号以同步你的进度'}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="block text-[13px] text-ink-2 mb-1.5">
                  用户名（可选）
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-surface border border-edge rounded-md text-sm focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
                  placeholder="可选"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-[13px] text-ink-2 mb-1.5">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface border border-edge rounded-md text-sm font-mono focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-[13px] text-ink-2 mb-1.5">
                密码
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface border border-edge rounded-md text-sm font-mono focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand/30 transition-all"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-[13px] text-err bg-err/10 border border-err/20 rounded-md px-3 py-2.5 anim-fade-in">
                <AlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2.5 bg-brand hover:opacity-90 disabled:opacity-50 rounded-md text-sm font-medium text-on-brand transition-all"
            >
              {submitting ? '处理中…' : mode === 'login' ? '登录' : '注册并登录'}
            </button>
          </form>

          <div className="mt-6 text-center text-[13px] text-ink-3">
            {mode === 'login' ? (
              <>
                还没有账号？{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-brand hover:underline"
                >
                  立即注册
                </button>
              </>
            ) : (
              <>
                已有账号？{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-brand hover:underline"
                >
                  前往登录
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
