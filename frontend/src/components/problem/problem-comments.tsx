'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { CommentsApi, type CommentItem } from '@/lib/api-client';
import { useProgressStore } from '@/store';

/** 相对时间格式化 */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins} 分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 天前`;
  return new Date(dateStr).toLocaleDateString('zh-CN');
}

interface Props {
  problemId: string;
}

/**
 * 评论/打卡社区组件：展示某题的讨论列表 + 发表评论。
 * 登录后可发表/删除自己的评论。
 */
export function ProblemComments({ problemId }: Props) {
  const user = useProgressStore((s) => s.user);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await CommentsApi.list(problemId);
      setComments(res.items);
      setTotal(res.total);
    } catch {
      // 静默失败
    } finally {
      setLoading(false);
    }
  }, [problemId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetchComments 内部 setState 均在 await 之后
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      const newComment = await CommentsApi.create(problemId, trimmed);
      setComments((prev) => [newComment, ...prev]);
      setTotal((t) => t + 1);
      setContent('');
    } catch {
      // 静默
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await CommentsApi.remove(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      setTotal((t) => t - 1);
    } catch {
      // 静默
    }
  };

  return (
    <div className="rounded-lg border border-edge bg-surface p-4">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare size={15} className="text-ink-3" />
        <h3 className="text-xs font-semibold text-ink">讨论 / 打卡</h3>
        <span className="text-[11px] text-ink-3">({total})</span>
      </div>

      {/* 发表评论 */}
      {user ? (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
            placeholder="分享你的思路或打卡…"
            className="flex-1 px-3 py-2 text-sm rounded-md border border-edge bg-surface-2 text-ink placeholder:text-ink-3 focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="px-3 py-2 rounded-md bg-brand text-on-brand text-sm font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <Send size={14} />
          </button>
        </div>
      ) : (
        <p className="text-xs text-ink-3 mb-4">
          <Link href="/login" className="text-brand hover:underline">登录</Link>
          后参与讨论
        </p>
      )}

      {/* 评论列表 */}
      {loading ? (
        <p className="text-xs text-ink-3 py-4 text-center">加载中…</p>
      ) : comments.length === 0 ? (
        <p className="text-xs text-ink-3 py-4 text-center">暂无评论，来抢沙发吧</p>
      ) : (
        <ul className="space-y-3 max-h-[300px] overflow-y-auto">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3 group">
              {/* 头像占位 */}
              <div className="w-7 h-7 rounded-full bg-brand-soft flex items-center justify-center text-[11px] font-bold text-brand shrink-0">
                {c.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-ink">{c.user.name}</span>
                  <span className="text-[10px] text-ink-3">{timeAgo(c.createdAt)}</span>
                  {user && user.id === c.userId && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="ml-auto opacity-0 group-hover:opacity-100 text-ink-3 hover:text-err transition-all"
                      title="删除"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-ink-2 mt-0.5 break-words">{c.content}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
