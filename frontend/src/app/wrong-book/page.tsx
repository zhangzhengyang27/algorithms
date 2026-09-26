import { BookX } from 'lucide-react';
import { WrongBook } from '@/components/wrong-book/wrong-book';

export const metadata = {
  title: '错题本',
  description: '自动收录运行失败的题目，间隔重复复习提醒',
};

/**
 * 错题本 + 间隔重复复习提醒。
 * 题目运行失败时自动收录；按 1/2/4/7/15/30 天曲线提醒复习。
 */
export default function WrongBookPage() {
  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-8 py-10">
      <div className="mb-8 anim-fade-up">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-md bg-warn/10 flex items-center justify-center">
            <BookX size={18} className="text-warn" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">错题本</h1>
        </div>
        <p className="text-ink-2 text-sm">运行失败的题目自动收录，按间隔重复曲线科学复习</p>
      </div>

      <div className="anim-fade-up stagger-1">
        <WrongBook />
      </div>
    </div>
  );
}
