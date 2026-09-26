import fs from "fs";
import path from "path";

/**
 * 内容/注册表一致性检查。
 *
 * 这一层是 `tsc` 抓不到的：`visualizer-registry.tsx` 用**字符串**按名字取命名导出
 * （`named(() => import("..."), "SortingPanel")` 内部是 `mod[name]`），所以面板里
 * 把组件改名、或注册表指错文件名时，类型检查照样通过，只有页面渲染时才炸。
 * 同理，教程页靠 `getVisualizerRoute()` 查这张表，映射指向一个不存在的 slug 也不会报错。
 *
 * 本项目曾发生过文件被批量删除的事故，这组用例就是那类改动的绊线。
 */

const SRC = path.join(__dirname, "..");
const REGISTRY_FILE = path.join(SRC, "lib/visualizer-registry.tsx");
const ROUTES_FILE = path.join(SRC, "lib/visualizer-routes.ts");
const PANELS_DIR = path.join(SRC, "components/visualizer");
const VISUALIZER_APP_DIR = path.join(SRC, "app/visualizer");
const TUTORIALS_DIR = path.join(SRC, "app/tutorials");

interface RegistryEntry {
  slug: string;
  file: string;
  exportName: string;
}

function parseRegistry(): RegistryEntry[] {
  const src = fs.readFileSync(REGISTRY_FILE, "utf8");
  return [...src.matchAll(
    /^\s*"?([a-z0-9-]+)"?\s*:\s*named\(\(\)\s*=>\s*import\("@\/components\/visualizer\/([^"]+)"\),\s*"([^"]+)"\)/gm,
  )].map((m) => ({ slug: m[1], file: m[2], exportName: m[3] }));
}

function parseTutorialMap(): { tutorial: string; visualizer: string; raw: string }[] {
  const src = fs.readFileSync(ROUTES_FILE, "utf8");
  const body = src.slice(src.indexOf("{"), src.lastIndexOf("}"));
  // 字符集刻意放宽到含大写与下划线：只匹配 [a-z0-9-] 会让 `"x": "X-TYPO",` 这类
  // 拼错的值**整行匹配不上而被静默丢弃**，于是错误值反而不会触发断言（实测漏检过）。
  return [...body.matchAll(
    /^\s*"?([A-Za-z0-9_-]+)"?\s*:\s*"?([A-Za-z0-9_-]+)"?,\s*(?:\/\/.*)?$/gm,
  )].map((m) => ({ tutorial: m[1], visualizer: m[2], raw: m[0] }));
}

/** 映射对象里「看起来就是一条形如 key: value, 的条目」的行数，用于校验解析器没漏。 */
function countTutorialMapLines(): number {
  const src = fs.readFileSync(ROUTES_FILE, "utf8");
  const body = src.slice(src.indexOf("{"), src.lastIndexOf("}"));
  return body.split("\n").filter((l) =>
    /^\s*"?[A-Za-z0-9_-]+"?\s*:\s*"?[A-Za-z0-9_-]+"?,\s*(?:\/\/.*)?$/.test(l),
  ).length;
}

const entries = parseRegistry();
const registrySlugs = new Set(entries.map((e) => e.slug));
const tutorialMap = parseTutorialMap();

describe("解析器自检（防止解析失效导致的假绿）", () => {
  // 若某天注册表写法变了使正则不再命中，entries 会变成空数组，
  // 后面所有 forEach 断言都会「零条全部通过」。这里先把下限钉死。
  it("注册表至少解析出 100 条，且不少于 panel 文件数的 8 成", () => {
    expect(entries.length).toBeGreaterThanOrEqual(100);
    const panelFiles = fs.readdirSync(PANELS_DIR).filter((f) => f.endsWith("-panel.tsx"));
    expect(entries.length).toBeGreaterThanOrEqual(Math.floor(panelFiles.length * 0.8));
  });

  it("tutorialToVisualizer 至少解析出 90 条", () => {
    expect(tutorialMap.length).toBeGreaterThanOrEqual(90);
  });

  it("映射条目解析数与文件里的条目行数一致（解析器不得静默漏行）", () => {
    expect(tutorialMap.length).toBe(countTutorialMapLines());
  });

  it("解析结果与实际 import 语句总数一致", () => {
    const src = fs.readFileSync(REGISTRY_FILE, "utf8");
    const importCount = (src.match(/named\(\(\)\s*=>\s*import\(/g) ?? []).length;
    expect(entries.length).toBe(importCount);
  });
});

describe("visualizerRegistry 完整性", () => {
  it("slug 无重复（字面量重复会静默覆盖前者）", () => {
    const seen = new Set<string>();
    const dupes = entries.filter((e) => (seen.has(e.slug) ? true : (seen.add(e.slug), false)));
    expect(dupes.map((d) => d.slug)).toEqual([]);
  });

  it("每条引用的 panel 文件都存在", () => {
    const missing = entries
      .filter((e) => !fs.existsSync(path.join(PANELS_DIR, `${e.file}.tsx`)))
      .map((e) => `${e.slug} → ${e.file}.tsx`);
    expect(missing).toEqual([]);
  });

  it("每条声称的命名导出真的在目标文件里导出", () => {
    const broken = entries.filter((e) => {
      const p = path.join(PANELS_DIR, `${e.file}.tsx`);
      if (!fs.existsSync(p)) return false; // 已由上一条报告
      const src = fs.readFileSync(p, "utf8");
      return !new RegExp(
        `export\\s+(?:async\\s+)?(?:function|const|class)\\s+${e.exportName}\\b|export\\s*\\{[^}]*\\b${e.exportName}\\b`,
      ).test(src);
    }).map((e) => `${e.slug}: ${e.file}.tsx 未导出 ${e.exportName}`);
    expect(broken).toEqual([]);
  });
});

describe("tutorialToVisualizer 映射完整性", () => {
  it("映射到的可视化 slug 都在注册表里", () => {
    const dead = tutorialMap
      .filter((m) => !registrySlugs.has(m.visualizer))
      .map((m) => `${m.tutorial} → ${m.visualizer}`);
    expect(dead).toEqual([]);
  });

  it("作为键的教程 slug 都有对应的 .md 文件", () => {
    const mdNames = new Set(
      fs.readdirSync(TUTORIALS_DIR).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")),
    );
    const missing = tutorialMap.filter((m) => !mdNames.has(m.tutorial)).map((m) => m.tutorial);
    expect(missing).toEqual([]);
  });

  it("不存在自映射到同名 slug 却无注册也无路由的情形", () => {
    // getVisualizerRoute 未命中时回退为 slug 自身，因此教程 slug 若既不在注册表、
    // 又没有同名可视化路由目录，嵌入会静默拿不到面板。
    const unresolved = tutorialMap
      .filter((m) => m.tutorial === m.visualizer)
      .filter((m) => !registrySlugs.has(m.visualizer))
      .map((m) => m.tutorial);
    expect(unresolved).toEqual([]);
  });
});

describe("可视化路由与面板对应", () => {
  const routeDirs = fs.readdirSync(VISUALIZER_APP_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  it("每个可视化路由目录都有 page.tsx", () => {
    const empty = routeDirs.filter((d) => !fs.existsSync(path.join(VISUALIZER_APP_DIR, d, "page.tsx")));
    expect(empty).toEqual([]);
  });

  it("路由目录数不低于注册表条目数（注册表新增 slug 时要配套建页）", () => {
    expect(routeDirs.length).toBeGreaterThanOrEqual(registrySlugs.size);
  });

  it("每个 page.tsx 引用的面板文件都存在，且其命名导出确实在该文件中", () => {
    const problems: string[] = [];
    for (const dir of routeDirs) {
      const pagePath = path.join(VISUALIZER_APP_DIR, dir, "page.tsx");
      if (!fs.existsSync(pagePath)) continue;
      const src = fs.readFileSync(pagePath, "utf8");
      for (const m of src.matchAll(
        /import\s*\{([^}]+)\}\s*from\s*["']@\/components\/visualizer\/([^"']+)["']/g,
      )) {
        const names = m[1].split(",").map((s) => s.trim().split(/\s+as\s+/)[0]).filter(Boolean);
        const panelPath = path.join(PANELS_DIR, `${m[2]}.tsx`);
        if (!fs.existsSync(panelPath)) {
          problems.push(`${dir}/page.tsx → ${m[2]}.tsx 不存在`);
          continue;
        }
        const panelSrc = fs.readFileSync(panelPath, "utf8");
        for (const n of names) {
          if (!new RegExp(`export\\s+(?:async\\s+)?(?:function|const|class)\\s+${n}\\b|export\\s*\\{[^}]*\\b${n}\\b`).test(panelSrc)) {
            problems.push(`${dir}/page.tsx 导入的 ${n} 未在 ${m[2]}.tsx 中导出`);
          }
        }
      }
    }
    expect(problems).toEqual([]);
  });
});
