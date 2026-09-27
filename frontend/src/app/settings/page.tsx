'use client';

import Link from 'next/link';
import { Palette, Code2, UserCircle, Info } from 'lucide-react';
import { useSettingsStore, useProgressStore } from '@/store';
import { AuthApi } from '@/lib/api-client';

export default function SettingsPage() {
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const setFontSize = useSettingsStore((s) => s.setFontSize);
  const animationSpeed = useSettingsStore((s) => s.animationSpeed);
  const setAnimationSpeed = useSettingsStore((s) => s.setAnimationSpeed);
  const soundEnabled = useSettingsStore((s) => s.soundEnabled);
  const toggleSound = useSettingsStore((s) => s.toggleSound);
  const user = useProgressStore((s) => s.user);
  const setAuth = useProgressStore((s) => s.setAuth);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-10">
      <div className="mb-8 anim-fade-up">
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">设置</h1>
        <p className="text-ink-2 text-sm">个性化你的学习体验</p>
      </div>

      <div className="grid lg:grid-cols-[180px_1fr] gap-8 max-w-4xl">
        {/* ─── Sidebar nav ─── */}
        <aside className="anim-fade-up stagger-1">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 lg:sticky lg:top-20">
            {[
              { id: 'appearance', label: '外观', icon: Palette },
              { id: 'editor', label: '编辑器', icon: Code2 },
              { id: 'account', label: '账号', icon: UserCircle },
              { id: 'about', label: '关于', icon: Info },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors whitespace-nowrap"
              >
                <item.icon size={14} className="text-ink-3" />
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* ─── Settings sections ─── */}
        <div className="space-y-6 anim-fade-up stagger-2">
          {/* Appearance */}
          <section id="appearance" className="bg-surface rounded-lg border border-edge p-6 scroll-mt-20">
            <h2 className="font-display text-sm font-semibold mb-5">外观</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[13px] text-ink-2 mb-2.5">主题</label>
                <div className="grid grid-cols-2 gap-2 max-w-xs">
                  {([
                    { value: 'dark', label: '深色', preview: 'bg-[#0c0d0f] border-edge-2' },
                    { value: 'light', label: '浅色', preview: 'bg-white border-gray-300' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTheme(opt.value)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md border text-[13px] transition-all ${
                        theme === opt.value
                          ? 'border-brand text-ink bg-brand-soft font-medium'
                          : 'border-edge text-ink-2 hover:border-edge-2'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded ${opt.preview} border`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex justify-between text-[13px] text-ink-2 mb-2.5">
                  <span>动画速度</span>
                  <span className="font-mono text-xs text-ink-3">{animationSpeed}ms</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="1500"
                  step="100"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  className="w-full max-w-xs accent-[var(--brand)]"
                />
                <p className="text-xs text-ink-3 mt-2">面板播放的基准间隔，面板内的倍率在此之上叠加</p>
              </div>

              <div className="flex items-center justify-between max-w-xs">
                <div>
                  <div className="text-[13px] font-medium">音效</div>
                  <div className="text-xs text-ink-3">播放完成提示音</div>
                </div>
                <button
                  onClick={toggleSound}
                  className={`relative w-10 h-[22px] rounded-full transition-colors ${
                    soundEnabled ? 'bg-brand' : 'bg-edge-2'
                  }`}
                  aria-pressed={soundEnabled}
                  aria-label="切换音效"
                >
                  <div
                    className={`absolute top-[3px] w-4 h-4 bg-white rounded-full transition-transform ${
                      soundEnabled ? 'left-[21px]' : 'left-[3px]'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Editor */}
          <section id="editor" className="bg-surface rounded-lg border border-edge p-6 scroll-mt-20">
            <h2 className="font-display text-sm font-semibold mb-5">编辑器</h2>
            <div>
              <label className="flex justify-between text-[13px] text-ink-2 mb-2.5">
                <span>字体大小</span>
                <span className="font-mono text-xs text-ink-3">{fontSize}px</span>
              </label>
              <input
                type="range"
                min="12"
                max="24"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full max-w-xs accent-[var(--brand)]"
              />
            </div>
          </section>

          {/* Account */}
          <section id="account" className="bg-surface rounded-lg border border-edge p-6 scroll-mt-20">
            <h2 className="font-display text-sm font-semibold mb-5">账号</h2>
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-soft flex items-center justify-center">
                    <UserCircle size={18} className="text-brand" />
                  </div>
                  <div>
                    <div className="text-sm font-medium font-mono">{user.email}</div>
                    <div className="text-xs text-ink-3">进度已同步</div>
                  </div>
                </div>
                <button
                  onClick={async () => { try { await AuthApi.logout(); } catch {} setAuth(null); }}
                  className="text-[13px] text-err hover:underline"
                >
                  退出登录
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[13px] text-brand hover:underline"
              >
                登录 / 注册以同步你的进度 →
              </Link>
            )}
          </section>

          {/* About */}
          <section id="about" className="bg-surface rounded-lg border border-edge p-6 scroll-mt-20">
            <h2 className="font-display text-sm font-semibold mb-5">关于</h2>
            <div className="space-y-1.5 text-[13px] text-ink-3 font-mono">
              <p>version: 1.0.0</p>
              <p>stack: Next.js 16 + NestJS 11 + Prisma + PostgreSQL</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
