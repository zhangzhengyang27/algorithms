/**
 * 公司出题频率标注数据（curated）。
 * 参考 LeetCode 题库高频统计，为常见题目标注高频面试公司及其出题热度。
 * freq: high(高频) / mid(中频) / low(低频)
 */
export type CompanyFreq = 'high' | 'mid' | 'low';

export interface CompanyTag {
  company: string;
  freq: CompanyFreq;
}

export const companyFrequency: Record<string, CompanyTag[]> = {
  'two-sum': [
    { company: 'Amazon', freq: 'high' },
    { company: 'Apple', freq: 'high' },
    { company: 'Adobe', freq: 'high' },
    { company: 'Microsoft', freq: 'mid' },
    { company: 'Google', freq: 'mid' },
  ],
  'valid-parentheses': [
    { company: 'Amazon', freq: 'high' },
    { company: 'Meta', freq: 'high' },
    { company: 'Bloomberg', freq: 'mid' },
  ],
  'reverse-linked-list': [
    { company: 'Amazon', freq: 'high' },
    { company: 'Microsoft', freq: 'mid' },
    { company: 'Apple', freq: 'mid' },
  ],
  'remove-linked-list-elements': [{ company: 'Amazon', freq: 'mid' }],
  'linked-list-cycle': [
    { company: 'Amazon', freq: 'mid' },
    { company: 'Microsoft', freq: 'mid' },
  ],
  'merge-two-sorted-lists': [
    { company: 'Amazon', freq: 'high' },
    { company: 'Meta', freq: 'mid' },
  ],
  'merge-sorted-array': [
    { company: 'Meta', freq: 'high' },
    { company: 'Amazon', freq: 'mid' },
  ],
  'binary-search': [
    { company: 'Amazon', freq: 'mid' },
    { company: 'Apple', freq: 'mid' },
  ],
  'search-insert-position': [{ company: 'Amazon', freq: 'low' }],
  'find-first-and-last-position': [{ company: 'Meta', freq: 'mid' }],
  'climbing-stairs': [
    { company: 'Amazon', freq: 'mid' },
    { company: 'Google', freq: 'mid' },
  ],
  'coin-change': [
    { company: 'Amazon', freq: 'high' },
    { company: 'Google', freq: 'mid' },
    { company: 'MathWorks', freq: 'mid' },
  ],
  'maximum-subarray': [
    { company: 'Amazon', freq: 'high' },
    { company: 'Microsoft', freq: 'mid' },
    { company: 'LinkedIn', freq: 'mid' },
  ],
  'best-time-to-buy-and-sell-stock': [
    { company: 'Amazon', freq: 'high' },
    { company: 'Meta', freq: 'high' },
    { company: 'Bloomberg', freq: 'mid' },
  ],
  'longest-substring-without-repeating': [
    { company: 'Amazon', freq: 'high' },
    { company: 'Bloomberg', freq: 'high' },
    { company: 'Apple', freq: 'mid' },
  ],
  'longest-common-subsequence': [{ company: 'Google', freq: 'mid' }],
  'longest-increasing-subsequence': [{ company: 'Google', freq: 'mid' }],
  'number-of-islands': [
    { company: 'Amazon', freq: 'high' },
    { company: 'Bloomberg', freq: 'high' },
    { company: 'Meta', freq: 'mid' },
    { company: 'Google', freq: 'mid' },
  ],
  'course-schedule': [
    { company: 'Amazon', freq: 'mid' },
    { company: 'Google', freq: 'mid' },
  ],
  'clone-graph': [{ company: 'Meta', freq: 'mid' }],
  'permutations': [
    { company: 'Amazon', freq: 'mid' },
    { company: 'Microsoft', freq: 'mid' },
  ],
  'subsets': [{ company: 'Meta', freq: 'mid' }],
  'combination-sum': [{ company: 'Airbnb', freq: 'mid' }],
  'top-k-frequent': [
    { company: 'Amazon', freq: 'high' },
    { company: 'Meta', freq: 'mid' },
  ],
  'smallest-k-numbers': [{ company: 'Amazon', freq: 'mid' }],
  'reverse-pairs': [{ company: 'Google', freq: 'low' }],
  'intersection-of-arrays': [{ company: 'Amazon', freq: 'mid' }],
  '3sum': [
    { company: 'Amazon', freq: 'high' },
    { company: 'Meta', freq: 'high' },
    { company: 'Bloomberg', freq: 'mid' },
  ],
  'container-with-most-water': [
    { company: 'Amazon', freq: 'high' },
    { company: 'Meta', freq: 'mid' },
  ],
  'house-robber': [{ company: 'Amazon', freq: 'mid' }],
  'jump-game': [{ company: 'Amazon', freq: 'mid' }],
  'invert-binary-tree': [{ company: 'Google', freq: 'mid' }],
  'maximum-depth-of-binary-tree': [{ company: 'Amazon', freq: 'mid' }],
  'same-tree': [{ company: 'Amazon', freq: 'low' }],
  'validate-binary-search-tree': [{ company: 'Amazon', freq: 'mid' }],
  'lowest-common-ancestor': [{ company: 'Meta', freq: 'mid' }],
  'min-stack': [{ company: 'Amazon', freq: 'mid' }],
};

/** 获取题目的公司出题频率标注（无数据返回 null） */
export function getCompanyFrequency(slug: string): CompanyTag[] | null {
  return companyFrequency[slug] ?? null;
}
