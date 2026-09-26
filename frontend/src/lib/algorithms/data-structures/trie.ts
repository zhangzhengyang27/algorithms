/**
 * 字典树 (Trie / Prefix Tree)
 * 支持插入、查找、前缀查找、删除
 * 移植自 Java DSA 项目 trie/
 */

class TrieNode {
  children: Map<string, TrieNode>;
  isWord: boolean;
  /** 以该节点为结尾的单词的附加信息（如词频） */
  value: number;

  constructor() {
    this.children = new Map();
    this.isWord = false;
    this.value = 0;
  }
}

export class Trie {
  private root: TrieNode;
  private _size: number;

  constructor() {
    this.root = new TrieNode();
    this._size = 0;
  }

  /** 存储的单词数量 */
  get size(): number {
    return this._size;
  }

  /** 插入单词 */
  add(word: string): void {
    let cur = this.root;
    for (const ch of word) {
      if (!cur.children.has(ch)) {
        cur.children.set(ch, new TrieNode());
      }
      cur = cur.children.get(ch)!;
    }
    if (!cur.isWord) {
      cur.isWord = true;
      this._size++;
    }
    cur.value++;
  }

  /** 查找单词是否存在 */
  contains(word: string): boolean {
    const node = this.getNode(word);
    return node !== null && node.isWord;
  }

  /** 是否有以 prefix 为前缀的单词 */
  hasPrefix(prefix: string): boolean {
    return this.getNode(prefix) !== null;
  }

  /** 删除单词 */
  remove(word: string): boolean {
    if (!this.contains(word)) return false;
    this.removeRecursive(this.root, word, 0);
    this._size--;
    return true;
  }

  /** 获取所有以 prefix 开头的单词 */
  wordsWithPrefix(prefix: string): string[] {
    const node = this.getNode(prefix);
    if (node === null) return [];
    const results: string[] = [];
    this.collect(node, prefix, results);
    return results;
  }

  /** 获取所有单词 */
  allWords(): string[] {
    return this.wordsWithPrefix('');
  }

  // ---- private ----

  private getNode(prefix: string): TrieNode | null {
    let cur = this.root;
    for (const ch of prefix) {
      if (!cur.children.has(ch)) return null;
      cur = cur.children.get(ch)!;
    }
    return cur;
  }

  private collect(node: TrieNode, prefix: string, results: string[]): void {
    if (node.isWord) results.push(prefix);
    for (const [ch, child] of node.children) {
      this.collect(child, prefix + ch, results);
    }
  }

  private removeRecursive(node: TrieNode, word: string, depth: number): boolean {
    if (depth === word.length) {
      node.isWord = false;
      node.value = 0;
      return node.children.size === 0;
    }
    const ch = word[depth];
    const child = node.children.get(ch);
    if (!child) return false;
    const shouldDelete = this.removeRecursive(child, word, depth + 1);
    if (shouldDelete) {
      node.children.delete(ch);
      return !node.isWord && node.children.size === 0;
    }
    return false;
  }
}

/**
 * LeetCode 208: 实现 Trie（前缀树）
 */
export class TrieLC208 {
  private trie: Trie;

  constructor() {
    this.trie = new Trie();
  }

  insert(word: string): void {
    this.trie.add(word);
  }

  search(word: string): boolean {
    return this.trie.contains(word);
  }

  startsWith(prefix: string): boolean {
    return this.trie.hasPrefix(prefix);
  }
}

/**
 * LeetCode 677: 键值映射 (MapSum)
 * 支持 insert(key, val) 和 sum(prefix)
 */
export class MapSum {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(key: string, val: number): void {
    let cur = this.root;
    for (const ch of key) {
      if (!cur.children.has(ch)) {
        cur.children.set(ch, new TrieNode());
      }
      cur = cur.children.get(ch)!;
    }
    cur.isWord = true;
    cur.value = val;
  }

  sum(prefix: string): number {
    let cur = this.root;
    for (const ch of prefix) {
      if (!cur.children.has(ch)) return 0;
      cur = cur.children.get(ch)!;
    }
    return this.sumRecursive(cur);
  }

  private sumRecursive(node: TrieNode): number {
    let total = node.isWord ? node.value : 0;
    for (const child of node.children.values()) {
      total += this.sumRecursive(child);
    }
    return total;
  }
}
