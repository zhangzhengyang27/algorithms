'use client';

import { Building2 } from 'lucide-react';
import { getCompanyFrequency, type CompanyFreq } from '@/lib/company-frequency';

const FREQ_META: Record<CompanyFreq, { label: string; dot: string; text: string }> = {
  high: { label: '高频', dot: 'bg-err', text: 'text-err' },
  mid: { label: '中频', dot: 'bg-warn', text: 'text-warn' },
  low: { label: '低频', dot: 'bg-ink-3', text: 'text-ink-3' },
};

/**
 * 公司出题频率标注：展示该题在各大公司的面试出题热度。
 * 无数据时返回 null。
 */
export function CompanyFrequencyBadges({ slug }: { slug: string }) {
  const tags = getCompanyFrequency(slug);
  if (!tags || tags.length === 0) return null;

  return (
    <div className="rounded-lg border border-edge bg-surface p-4">
      <div className="flex items-center gap-2 mb-3">
        <Building2 size={15} className="text-ink-3" />
        <h3 className="text-xs font-semibold text-ink">公司出题频率</h3>
        <span className="ml-auto flex items-center gap-2 text-[10px] text-ink-3">
          {(['high', 'mid', 'low'] as CompanyFreq[]).map((f) => (
            <span key={f} className="inline-flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${FREQ_META[f].dot}`} />
              {FREQ_META[f].label}
            </span>
          ))}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <span
            key={t.company}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-2 border border-edge text-[12px] text-ink-2"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${FREQ_META[t.freq].dot}`} />
            {t.company}
          </span>
        ))}
      </div>
    </div>
  );
}
