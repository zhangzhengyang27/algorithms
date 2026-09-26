'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { Copy, Check, ChevronDown } from 'lucide-react';
import hljs from 'highlight.js/lib/core';
import java from 'highlight.js/lib/languages/java';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import javascript from 'highlight.js/lib/languages/javascript';

hljs.registerLanguage('java', java);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);

interface CodeTabItem {
  lang: string;
  label: string;
  value: string;
}

interface CodeTabsProps {
  tabs: CodeTabItem[];
}

/**
 * 多语言代码块切换组件
 * 渲染带语言标签栏 + 复制按钮的代码展示区
 */
export function CodeTabs({ tabs }: CodeTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const codeRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTab = tabs[activeIndex];

  // 语法高亮：当 activeIndex 变化时重新高亮
  useEffect(() => {
    const el = codeRef.current;
    if (!el) return;
    // 清除 highlight.js 的已高亮标记，允许重新高亮
    delete el.dataset.highlighted;
    el.className = `language-${activeTab.lang} hljs`;
    el.textContent = activeTab.value;
    try {
      hljs.highlightElement(el);
    } catch {
      // 语言未注册时 fallback：纯文本
      el.textContent = activeTab.value;
    }
  }, [activeIndex, activeTab.lang, activeTab.value]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(activeTab.value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeTab.value]);

  // 关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  // 可见标签和溢出标签
  const MAX_VISIBLE = 5;
  const visibleTabs = tabs.slice(0, MAX_VISIBLE);
  const overflowTabs = tabs.slice(MAX_VISIBLE);

  return (
    <div className="code-tabs my-4 rounded-lg border border-edge overflow-hidden">
      {/* 标签栏 */}
      <div className="flex items-center border-b border-edge bg-surface-2/50">
        {/* 下拉箭头（溢出标签） */}
        {overflowTabs.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-2 py-2.5 text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors"
              aria-label="更多语言"
            >
              <ChevronDown size={14} />
            </button>
            {dropdownOpen && (
              <div className="absolute top-full left-0 z-50 min-w-[120px] bg-surface border border-edge rounded-md shadow-lg py-1">
                {overflowTabs.map((tab, i) => {
                  const realIndex = i + MAX_VISIBLE;
                  return (
                    <button
                      key={tab.lang + i}
                      type="button"
                      onClick={() => { setActiveIndex(realIndex); setDropdownOpen(false); }}
                      className={clsx(
                        'block w-full text-left px-3 py-1.5 text-sm transition-colors',
                        realIndex === activeIndex
                          ? 'text-brand bg-brand-soft'
                          : 'text-ink-2 hover:text-ink hover:bg-surface-2'
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 标签按钮 */}
        <div className="flex items-center flex-1 overflow-x-auto scrollbar-none">
          {visibleTabs.map((tab, i) => (
            <button
              key={tab.lang + i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all relative',
                i === activeIndex
                  ? 'text-ink'
                  : 'text-ink-3 hover:text-ink-2'
              )}
            >
              {tab.label}
              {i === activeIndex && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* 复制按钮 */}
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-ink-3 hover:text-ink transition-colors whitespace-nowrap"
          aria-label="复制代码"
        >
          {copied ? <Check size={13} className="text-ok" /> : <Copy size={13} />}
          <span>{copied ? '已复制' : '复制代码'}</span>
        </button>
      </div>

      {/* 代码区域 */}
      <div className="bg-surface overflow-x-auto">
        <pre className="p-4 m-0 text-sm leading-relaxed">
          <code ref={codeRef} className={`language-${activeTab.lang} text-sm font-mono`}>
            {activeTab.value}
          </code>
        </pre>
      </div>
    </div>
  );
}
