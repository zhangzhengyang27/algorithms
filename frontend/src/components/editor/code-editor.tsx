'use client';

import { useState, useRef } from 'react';
import {
  Copy,
  Check,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';
import { useSettingsStore } from '@/store';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onRun?: (code: string) => { output?: string; error?: string } | Promise<{ output?: string; error?: string }>;
  height?: string;
  enableDebugTrace?: boolean;
}

interface TraceEntry {
  step: number;
  message: string;
}

function renderValue(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function CodeEditor({
  initialCode = '',
  language = 'javascript',
  onRun,
  height = '400px',
  enableDebugTrace = false,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const [traceIndex, setTraceIndex] = useState(0);
  const editorRef = useRef<unknown>(null);
  const currentTheme = useSettingsStore((s) => s.theme);
  const isLight = currentTheme === 'light';
  const editorFontSize = useSettingsStore((s) => s.fontSize);

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  const handleRun = async () => {
    setError('');
    setOutput('');
    setTrace([]);
    setTraceIndex(0);

    if (onRun) {
      try {
        const result = await onRun(code);
        setOutput(result.output || '');
        setError(result.error || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      return;
    }

    // 没有宿主执行器就不在主线程跑用户代码：这里的 code 可能来自数据库的
    // problem.defaultCode，用 eval 执行等于给入库内容开了带 DOM 和 cookie 的同源通道。
    setError('该页面未接入代码执行器');
  };

  const collectTrace = () => {
    if (!enableDebugTrace) return;
    setError('');
    try {
      const traceEntries: TraceEntry[] = [];
      let step = 0;
      // User calls dbg(...) inside their code to record a snapshot.
      const dbg = (...args: unknown[]) => {
        step += 1;
        traceEntries.push({
          step,
          message: args.map((a) => renderValue(a)).join(' '),
        });
      };

      const originalLog = console.log;
      const logs: string[] = [];
      console.log = (...args: unknown[]) =>
        logs.push(args.map((a) => renderValue(a)).join(' '));

      const wrapped = `
        "use strict";
        var dbg = arguments[0];
        ${code}
      `;
      const fn = new Function(wrapped);
      try {
        fn(dbg);
      } finally {
        console.log = originalLog;
      }

      setTrace(traceEntries);
      setTraceIndex(traceEntries.length);
      setOutput(logs.join('\n'));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput('');
    setError('');
    setTrace([]);
    setTraceIndex(0);
    const editor = editorRef.current as { setValue?: (v: string) => void } | null;
    if (editor?.setValue) editor.setValue(initialCode);
  };

  const stepBack = () => setTraceIndex((i) => Math.max(0, i - 1));
  const stepForward = () => setTraceIndex((i) => Math.min(trace.length, i + 1));

  const visibleTrace = trace.slice(0, traceIndex);

  return (
    <div className={`flex flex-col h-full rounded-xl border overflow-hidden ${isLight ? 'bg-white border-edge-2' : 'bg-[#0a0a0a] border-[#222222]'}`}>
      <div className={`flex items-center justify-between px-4 py-3 border-b ${isLight ? 'bg-surface-2 border-edge-2' : 'bg-[#111111] border-[#222222]'}`}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-gray-500">{language.toUpperCase()}</span>
          {enableDebugTrace && (
            <span className="ml-2 text-xs text-purple-400">调试模式</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {enableDebugTrace && (
            <>
              <button
                type="button"
                onClick={stepBack}
                disabled={traceIndex === 0}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-40"
                aria-label="上一步"
                title="Step Over (back)"
              >
                <SkipBack size={16} />
              </button>
              <button
                type="button"
                onClick={stepForward}
                disabled={traceIndex >= trace.length}
                className="p-2 text-gray-400 hover:text-white disabled:opacity-40"
                aria-label="下一步"
                title="Step Over (forward)"
              >
                <SkipForward size={16} />
              </button>
              <button
                type="button"
                onClick={collectTrace}
                className="px-3 py-1.5 text-xs bg-purple-500 hover:bg-purple-600 rounded text-white"
                title="运行并收集 dbg() 调用轨迹"
              >
                追踪
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-white"
            aria-label="复制代码"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 text-gray-400 hover:text-white"
            aria-label="重置"
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={handleRun}
            className="px-3 py-1.5 text-xs bg-green-500 hover:bg-green-600 rounded text-white"
          >
            <Play size={14} className="inline mr-1" />
            运行
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <MonacoEditor
          height="100%"
          language={language}
          theme={isLight ? 'vs' : 'vs-dark'}
          value={code}
          onChange={(value) => setCode(value ?? '')}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: editorFontSize,
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            tabSize: 2,
          }}
        />
      </div>

      <div
        className={`border-t p-3 overflow-auto ${isLight ? 'bg-surface border-edge' : 'border-[#222222] bg-[#0a0a0a]'}`}
        style={{ maxHeight: height === '100%' ? '40%' : '160px' }}
      >
        {error ? (
          <pre className="text-sm text-red-400 whitespace-pre-wrap font-mono">{error}</pre>
        ) : enableDebugTrace && trace.length > 0 ? (
          <div className="space-y-2">
            <div className="text-xs text-gray-500">
              调试轨迹 {traceIndex} / {trace.length}
            </div>
            {visibleTrace.length === 0 ? (
              <div className="text-xs text-gray-600">点击「下一步」逐条查看快照</div>
            ) : (
              <ul className="space-y-1 max-h-32 overflow-auto">
                {visibleTrace.map((entry) => (
                  <li key={entry.step} className="text-xs font-mono">
                    <span className="text-gray-500 mr-2">step {entry.step}</span>
                    <span className="text-blue-400">{entry.message}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
            {output || (
              <span className="text-gray-600">
                点击「运行」执行代码。
                {enableDebugTrace && (
                  <>
                    <br />
                    在代码中调用 <code className="text-blue-400">dbg(value)</code> 记录快照，再点「追踪」按步查看。
                  </>
                )}
              </span>
            )}
          </pre>
        )}
      </div>
    </div>
  );
}
