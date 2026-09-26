'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Book, Code, BarChart3, Settings, Menu, X, Layers, LogIn, LogOut, User, Map, ListChecks, BookX } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useProgressStore } from '@/store';
import { AuthApi } from '@/lib/api-client';

const navItems = [
  { href: '/', label: '首页', icon: Home },
  { href: '/roadmap', label: '路线图', icon: Map },
  { href: '/study-plan', label: '题单', icon: ListChecks },
  { href: '/tutorials', label: '教程', icon: Book },
  { href: '/problems', label: '题目', icon: Code },
  { href: '/visualizer', label: '可视化', icon: BarChart3 },
  { href: '/wrong-book', label: '错题本', icon: BookX },
  { href: '/progress', label: '进度', icon: Layers },
];

export function TopNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const user = useProgressStore((s) => s.user);
  const setAuth = useProgressStore((s) => s.setAuth);

  const logout = async () => {
    try {
      await AuthApi.logout();
    } catch {
      // ignore logout errors; clear local session regardless
    }
    setAuth(null);
    setIsOpen(false);
  };

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(href + '/'));

  return (
    <header className="sticky top-0 z-40 w-full bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-4 md:px-8 border-b border-edge">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2.5 shrink-0 group"
        >
          <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-on-brand font-bold text-xs font-mono">{'{A}'}</span>
          </div>
          <span className="font-semibold tracking-tight hidden sm:inline font-display">
            AlgoViz
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={clsx(
                  'relative flex items-center gap-2 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors whitespace-nowrap shrink-0',
                  active
                    ? 'text-ink bg-surface-2'
                    : 'text-ink-3 hover:text-ink hover:bg-surface-2/60'
                )}
              >
                <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                <span className="hidden lg:inline">{item.label}</span>
                {active && (
                  <span className="absolute -bottom-[13px] left-3 right-3 h-[2px] bg-brand rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side (desktop) */}
        <div className="hidden md:flex items-center gap-2 shrink-0 ml-auto">
          <Link
            href="/settings"
            className="p-2 rounded-md text-ink-3 hover:text-ink hover:bg-surface-2/60 transition-colors"
            title="设置"
          >
            <Settings size={16} />
          </Link>
          {user ? (
            <div className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-md glass-card">
              <div className="w-5 h-5 rounded-full bg-brand-soft flex items-center justify-center">
                <User size={11} className="text-brand" />
              </div>
              <span className="text-xs text-ink-2 truncate max-w-[120px] font-mono" title={user.email}>
                {user.email}
              </span>
              <button
                onClick={logout}
                className="p-1 rounded text-ink-3 hover:text-err transition-colors"
                title="退出登录"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium bg-surface border border-edge text-ink-2 hover:text-ink hover:border-edge-2 transition-all"
            >
              <LogIn size={14} />
              登录
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden ml-auto p-2 rounded-md bg-surface border border-edge text-ink-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="切换菜单"
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-edge bg-bg/95 backdrop-blur-xl anim-fade-in">
          <nav className="px-4 py-3 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors',
                    active
                      ? 'bg-brand-soft text-brand font-medium'
                      : 'text-ink-2 hover:text-ink hover:bg-surface-2'
                  )}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-4 pb-4 pt-2 border-t border-edge space-y-1">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors"
            >
              <Settings size={17} />
              设置
            </Link>
            {user ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-ink-2 glass-card">
                <div className="w-6 h-6 rounded-full bg-brand-soft flex items-center justify-center">
                  <User size={12} className="text-brand" />
                </div>
                <span className="truncate flex-1 font-mono text-xs" title={user.email}>{user.email}</span>
                <button
                  onClick={logout}
                  className="p-1 rounded text-ink-3 hover:text-err transition-colors"
                  title="退出登录"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-ink-2 hover:text-ink hover:bg-surface-2 transition-colors"
              >
                <LogIn size={17} />
                登录 / 注册
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
