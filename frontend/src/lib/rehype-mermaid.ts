// rehype 插件：在 rehype-highlight 之前把 ```mermaid 代码块抽成 <mermaid-diagram> 自定义元素，
// 避免 highlight.js 把 mermaid 当普通代码做 token 化，从而破坏图表渲染。
// 抽出后由 markdown-content 的 components['mermaid-diagram'] 交给 <MermaidDiagram> 渲染。

type HastNode = {
  type?: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

function textOf(node: HastNode | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  if (Array.isArray(node.children)) return node.children.map(textOf).join("");
  return "";
}

export function rehypeExtractMermaid() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (!node || !Array.isArray(node.children)) return;
      for (let i = 0; i < node.children.length; i++) {
        const el = node.children[i];
        if (
          el &&
          el.type === "element" &&
          el.tagName === "pre" &&
          Array.isArray(el.children)
        ) {
          const code = el.children.find(
            (c: HastNode) => c.type === "element" && c.tagName === "code"
          );
          if (code) {
            const cls = code.properties?.className;
            const list: string[] = Array.isArray(cls)
              ? (cls as string[])
              : cls
                ? [String(cls)]
                : [];
            if (list.includes("language-mermaid")) {
              const chart = textOf(code).replace(/\n$/, "");
              node.children[i] = {
                type: "element",
                tagName: "mermaid-diagram",
                properties: { chart },
                children: [],
              };
              continue;
            }
          }
        }
        walk(el);
      }
    };
    walk(tree);
  };
}
