// 二分查找算法
export interface SearchStep {
  array: number[];
  low: number;
  high: number;
  mid: number;
  target: number;
  found: boolean;
  comparing: number[];
  description: string;
}

export function generateBinarySearchSteps(
  arr: number[],
  target: number
): SearchStep[] {
  const steps: SearchStep[] = [];
  const array = [...arr].sort((a, b) => a - b); // 确保有序
  let low = 0;
  let high = array.length - 1;

  steps.push({
    array,
    low,
    high,
    mid: -1,
    target,
    found: false,
    comparing: [],
    description: `在有序数组中查找 ${target}，初始范围 [${low}, ${high}]`,
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    steps.push({
      array,
      low,
      high,
      mid,
      target,
      found: false,
      comparing: [mid],
      description: `检查中间位置 arr[${mid}] = ${array[mid]}`,
    });

    if (array[mid] === target) {
      steps.push({
        array,
        low,
        high,
        mid,
        target,
        found: true,
        comparing: [mid],
        description: `找到目标 ${target} 在索引 ${mid}`,
      });
      return steps;
    } else if (array[mid] < target) {
      low = mid + 1;
      steps.push({
        array,
        low,
        high,
        mid,
        target,
        found: false,
        comparing: [],
        description: `arr[${mid}] = ${array[mid]} < ${target}，在右半部分继续查找`,
      });
    } else {
      high = mid - 1;
      steps.push({
        array,
        low,
        high,
        mid,
        target,
        found: false,
        comparing: [],
        description: `arr[${mid}] = ${array[mid]} > ${target}，在左半部分继续查找`,
      });
    }
  }

  steps.push({
    array,
    low,
    high,
    mid: -1,
    target,
    found: false,
    comparing: [],
    description: `未找到目标 ${target}`,
  });

  return steps;
}

// 生成随机有序数组
export function generateSortedArray(size: number, max = 100): number[] {
  const arr: number[] = [];
  let val = Math.floor(Math.random() * 10) + 1;
  for (let i = 0; i < size; i++) {
    arr.push(val);
    val += Math.floor(Math.random() * 10) + 1;
  }
  return arr;
}
