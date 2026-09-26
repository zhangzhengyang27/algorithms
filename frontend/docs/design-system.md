# AlgVisual 双模式设计系统规范

> 本文档是 **AlgVisual 算法可视化学习平台** 前端视觉规范的权威参考。
> 所有颜色、字体、组件样式的最终实现都来自 `frontend/src/app/globals.css`（项目唯一主题来源）。
> 配套 Ardot 设计稿：`https://ardot.tencent.com/file/710573824965616`
> 适用范围：首页、路线图、可视化、题目详情、教程 共 5 类页面（暗 / 亮双模式）。

---

## 1. 设计哲学

- **深色科技感为基底**：默认暗色，营造代码 / 终端般的沉浸氛围；亮色模式作为可读备选，两者通过同一组语义 token 切换，绝不写死颜色。
- **玻璃质感**：用「白透填充 + 细描边 + 内外双层阴影」模拟毛玻璃（平台不支持 `backdrop-blur`，故以透明度近似）。
- **明暗对比**：亮色页面上的代码窗 / 终端 / 示例框 / 可视化舞台**刻意保留深色窗**，形成主流科技站的明暗节奏。
- **语义化优先**：所有颜色走 `--brand` / `--ok` / `--err` 等语义变量，组件只消费语义类，禁止硬编码 hex。

---

## 2. 双模式机制

| 项 | 说明 |
| --- | --- |
| 默认模式 | 暗色，定义在 `:root` |
| 亮色模式 | 在 `<html>` 上挂 `.light` 类，覆盖同一组 token |
| 切换方式 | `ThemeProvider` 在 `<html>` 上 toggle `.light`（`store` 默认 `theme:'dark'`） |
| Tailwind 接线 | `globals.css` 中 `@theme inline` 把语义变量映射为 `bg-bg` / `text-ink` / `border-edge` / `bg-brand` 等工具类 |
| 使用约定 | 组件一律用语义工具类；**勿用** legacy 的 `bg-background` / `text-foreground` |

---

## 3. 颜色 Token（暗 / 亮双值）

> 数值直接取自 `globals.css`。组件请消费 Tailwind 语义类（如 `bg-surface`、`text-ink-2`），而非下方 hex。

### 3.1 基础面与文字

| Token | 暗色（`:root`） | 亮色（`.light`） | 用途 |
| --- | --- | --- | --- |
| `--bg` | `#050506` | `#f7f8fa` | 页面底色 |
| `--surface` | `#0c0d0f` | `#ffffff` | 卡片 / 面板底 |
| `--surface-2` | `#131417` | `#eef0f4` | 次级面（代码窗、hover 等） |
| `--edge` | `#1e2025` | `#e2e5ea` | 边框 / 分隔线 |
| `--edge-2` | `#2c2f36` | `#cdd1d9` | 次级边框（hover、强调描边） |
| `--ink` | `#eceef1` | `#101216` | 主文字 |
| `--ink-2` | `#9ba1ab` | `#4c525c` | 次要文字 |
| `--ink-3` | `#5d636d` | `#8b919b` | 辅助 / 占位文字 |

### 3.2 品牌与语义状态

| Token | 暗色 | 亮色 | 语义 |
| --- | --- | --- | --- |
| `--brand` | `#4f8ff7` | `#2563eb` | 品牌主色 / 链接 / 强调 |
| `--brand-soft` | `rgba(79,143,247,.09)` | `rgba(37,99,235,.06)` | 品牌淡底（选中、高亮区） |
| `--on-brand` | `#ffffff` | `#ffffff` | 品牌色之上的文字 |
| `--ok` | `#34d399` | `#059669` | 成功 / AC |
| `--warn` | `#fbbf24` | `#b45309` | 警告 / WA / 难度「中等」 |
| `--err` | `#f87171` | `#dc2626` | 错误 / ERR / 难度「困难」 |

### 3.3 环境层

| Token | 暗色 | 亮色 | 用途 |
| --- | --- | --- | --- |
| `--grid-dot` | `rgba(255,255,255,.035)` | `rgba(0,0,0,.045)` | 网格点阵背景 |
| `--glow` | `rgba(79,143,247,.07)` | `rgba(37,99,235,.05)` | 顶部光晕 |

---

## 4. 字体规范

| 角色 | 字族 | 用途 | 常用字重 |
| --- | --- | --- | --- |
| 显示 / 标题 | `'Space Grotesk'`（`--font-display`） | H1–H4、Logo、数据数字 | Bold `700` / Medium `500` |
| 正文 | 系统无衬线栈（PingFang SC / Noto Sans SC / Microsoft YaHei）+ 设计稿演示用 `Inter` | 段落、按钮、副文案 | Regular `400` / SemiBold `600` |
| 等宽 | `'JetBrains Mono'`（`--font-mono`） | 代码、标签、指标数字、区块小标 | Medium `500` |

**字号层级（建议）**

| 层级 | 字号 | 字重 | 示例 |
| --- | --- | --- | --- |
| 区块标题 | 30px | Space Grotesk Bold | 「覆盖 8 大核心算法领域」 |
| 卡片标题 | 16–18px | Space Grotesk Medium | 分类卡名、特性卡名 |
| 正文 | 14–15px | Inter Regular | 描述、副标题 |
| 小标 / 标签 | 13px | JetBrains Mono Medium | 区块标签、题数、难度 |

---

## 5. 玻璃卡标准配方

所有悬浮面板 / 卡片统一复用此配方，仅按尺寸调整圆角。

### 5.1 暗色模式（推荐，默认）

```
填充：rgba(255, 255, 255, 0.05)        // 白透 5%
描边：rgba(255, 255, 255, 0.12)        // 白描边 12%
阴影1（外）：0 10px 30px rgba(0,0,0,0.4)
阴影2（内）：inset 0 1px 2px rgba(255,255,255,0.18)
圆角：14（卡片）/ 12（小卡）/ 18（横幅）
```

### 5.2 亮色模式

```
填充：#ffffff                          // 实白底
描边：#e2e5ea                          // 浅灰边
阴影（外）：0 8px 20px rgba(0,0,0,0.08)
圆角：同暗色
```

> 亮色页上的代码窗 / 终端 / 可视化舞台**保持暗色窗**（见 §3.1 `--surface-2` 暗值），不做白卡反转。

---

## 6. 渐变按钮

主行动按钮（CTA）统一使用品牌→青色线性渐变：

```
背景：linear-gradient(135deg, #5B9CFF 0%, #38E8C9 100%)
文字：#07121A                          // 亮底上的近黑字
高度：44px   圆角：10px   左右内距：24px
```

| 状态 | 处理 |
| --- | --- |
| 默认 | 渐变填充 + 近黑文字 |
| Hover | 轻微提亮 / 上浮 1px（配合 §8 动效） |
| 禁用 | 降透明度至 0.5，渐变保留 |

---

## 7. 语义状态与难度标签

| 场景 | 颜色 Token | 暗色值 | 亮色值 |
| --- | --- | --- | --- |
| AC / 通过 / 成功 | `--ok` | `#34d399` | `#059669` |
| WA / 警告 / 中等难度 | `--warn` | `#fbbf24` | `#b45309` |
| ERR / 错误 / 困难难度 | `--err` | `#f87171` | `#dc2626` |

**难度标签用法**：简单（绿 / `--ok`）、中等（橙 / `--warn`）、困难（红 / `--err`），以胶囊 + 对应语义色文字呈现。

---

## 8. 环境背景与动效（可选复用）

| 类 | 实现 |
| --- | --- |
| 网格点阵 | `.bg-grid-dots`：28px 间距、1px 点，`var(--grid-dot)` |
| 顶部光晕 | `.bg-glow-top`：顶部椭圆径向渐变，`var(--glow)` |
| 入场动效 | `.anim-fade-up` / `.anim-fade-in` / `.anim-scale-in`，缓动 `cubic-bezier(0.16,1,0.3,1)` |
| 错峰延迟 | `.stagger-1 ~ .stagger-6`（0.05s → 0.30s） |
| 降级 | `@media (prefers-reduced-motion: reduce)` 全部关闭动画 |

---

## 9. 落地检查清单

- [ ] 所有颜色走语义 token / Tailwind 语义类，无硬编码 hex（除 §5/§6 明确给出的玻璃与渐变配方）
- [ ] 暗 / 亮双模式仅通过 `.light` 切换，组件不写死颜色
- [ ] 卡片复用 §5 玻璃配方，亮色页代码窗保持暗色
- [ ] 主按钮用 §6 渐变，文字 `#07121A`
- [ ] 难度 / 状态色使用 §7 语义映射

---

## 10. 页面组件规格

> 本节约等于「照着还原」的逐页组件尺寸。所有页面画布**宽度统一 1180px**，暗/亮两版共用同一套尺寸、仅配色不同。
> 数据来源：全部为 Ardot 设计稿实测值（适配器恢复后于 2026-08-02 读取节点几何），区别于 §3 的颜色 token（来自 `globals.css`）。

### 10.1 首页（深 `2:70` / 亮 `2:106`）

画布：1180 × 2120

| 组件 | 尺寸 (W×H) | 关键样式 |
| --- | --- | --- |
| 特性亮点区 | 满宽 / 480 | 竖向 gap24，侧边距 64，上边距 80 |
| ├ 区块标签 | — | JetBrains Mono 13，brand 蓝 |
| ├ 区块标题 | — | Space Grotesk Bold 30，ink |
| ├ 区块副标题 | W 680 | Inter 15，ink-2 |
| └ 特性卡 ×3 | 336 × 188 | pad 20/20/22/22，radius 14，gap 12；图标 36×36 |
| 算法分类区 | 满宽 / 440 | 竖向 gap24，侧边距 64，上边距 80 |
| └ 分类卡 ×8 | 247 × 92 | pad 18，radius 12，gap 6；分类行 gap 16 |
| 学习路径 CTA | 满宽 / 240 | 上边距 80 |
| └ CTA 横幅 | 1052 × 160 | pad 40，radius 18，SPACE_BETWEEN + CENTER |
| 　 └ CTA 按钮 | 自适应 / 44 | pad x24，radius 10，§6 渐变，文字 #07121A |
| 页脚 | 满宽 / 140 | pad 64/64/48/48，SPACE_BETWEEN + CENTER |

### 10.2 路线图（深 `3:1` / 亮 `3:32`）

画布：1180 × 600　|　内容容器内边距 64（左右）/ 标题 y:48

| 组件 | 尺寸 (W×H) | 关键样式 |
| --- | --- | --- |
| 页面标题 | — | 32px Space Grotesk Bold，ink |
| 页面副标题 | W 279 | 15px Inter Regular，ink-2 |
| 阶段行 | 1052 × 140 | 横向，itemSpacing 16（x:64） |
| 阶段卡 ×4 | 248 × 140 | radius 14，竖向 itemSpacing 10，pad 20/20/22/22；亮色实白底+浅灰边 |
| ├ 阶段标签 | — | 12px JetBrains Mono Medium，brand 蓝（「阶段 01」） |
| ├ 阶段标题 | — | 18px Space Grotesk Medium，ink |
| └ 阶段主题 | — | 13px Inter Regular，ink-2 |

### 10.3 可视化（深 `3:63` / 亮 `3:138`）

画布：1180 × 900　|　内容容器 y:56 / 高 784

| 组件 | 尺寸 (W×H) | 关键样式 |
| --- | --- | --- |
| 标题行 | 1052 × 100 | 横向 itemSpacing 24（x:64） |
| ├ 标题列 | 315 × 69 | 标题 + 副标题 |
| └ 算法选择胶囊组 | 260 × 32 | 横向 itemSpacing 10（x:339） |
| 　 ├ 算法胶囊-选中 | 80 × 32 | radius 999，brand 16% 底 + brand 60% 描边；13px Inter Medium 亮蓝 |
| 　 └ 算法胶囊 ×2 | 80 × 32 | radius 999，surface 底 + edge 描边；13px Inter Regular ink-2 |
| 主内容两栏 | 1052 × 536 | 横向 itemSpacing 24 |
| 左列-舞台与控制 | 720 × 536 | 竖向 itemSpacing 16 |
| ├ 可视化舞台 | 720 × 420 | radius 16，§5.1 玻璃配方；CENTER |
| │　 ├ 舞台说明 | — | 14px JetBrains Mono Regular，ink-2 |
| │　 └ 数组方块行 | 540 × 80 | 横向 itemSpacing 12，CENTER（含基准蓝/当前比较高亮） |
| └ 控制条 | 720 × 100 | radius 12，surface 底 + edge 描边 |
| 　　├ 播放按钮 | 44 × 44（圆） | brand 填充 |
| 　　├ 进度条底 | 420 × 6 | radius 3，edge 底 |
| 　　└ 步进按钮 | 40 × 40 | radius 10，surface-2 底 + edge-2 描边 |
| 右列-步骤与复杂度 | 308 × 382 | 竖向 itemSpacing 16 |
| ├ 执行步骤面板 | 308 × 212 | radius 14，surface 底 + edge 描边，竖向 itemSpacing 14，pad 20 |
| │　 ├ 面板标题 | — | 16px Space Grotesk Bold，ink |
| │　 ├ 步骤徽章 | 92 × 24 | radius 999，brand 16% 底 |
| │　 ├ 步骤行-当前 | 209 × 24 | — |
| │　 └ 步骤行 ×2 | 162 × 24 / 147 × 24 | — |
| └ 复杂度面板 | 308 × 154 | radius 14，surface 底 + edge 描边，竖向 itemSpacing 12，pad 20 |
| 　　├ 面板标题 | — | 16px Space Grotesk Bold，ink |
| 　　└ 复杂度行 ×3 | 163×20 / 145×20 / 75×18 | 时间 / 空间 |

### 10.4 题目详情（深 `4:1` / 亮 `4:78`）

画布：1180 × 1160　|　内容容器 y:56 / 高 1083

| 组件 | 尺寸 (W×H) | 关键样式 |
| --- | --- | --- |
| 标题行 | 1052 × 120 | 横向 itemSpacing 24（x:64）；题号徽章 + 标题 + 难度标签（中等橙 / 困难红） |
| └ 标题列 | 218 × 108 | 竖向 itemSpacing 10 |
| 主内容两栏 | 1052 × 815 | 横向 itemSpacing 24 |
| 左列-题目描述 | 640 × 477 | 竖向 itemSpacing 16 |
| └ 描述卡片 | 640 × 477 | radius 14，surface 底 + edge 描边，竖向 itemSpacing 14，pad 24 |
| 　　├ 区块标题 | — | 16px Space Grotesk Bold（「题目描述」）/ 15px Medium（「示例」「约束」），ink |
| 　　├ 题干段落 | W 592 | 14px Inter Regular，行高 22px，ink-3 |
| 　　├ 示例框 ×2 | 592 × 74 | radius 10，surface-2 暗窗（保持深色） |
| 　　└ 约束列表 | W 592 | 13px Inter Regular，行高 20px，ink-2 |
| 右列-编辑器与提交 | 388 × 815 | 竖向 itemSpacing 16 |
| ├ 代码编辑器 | 388 × 256 | radius 14，surface-2 暗窗 |
| │　 ├ 语言 Tab 行 | 388 × 100 | 横向 itemSpacing 4 |
| │　 └ 代码区 | 388 × 156 | 竖向 itemSpacing 6（y:100） |
| ├ 提交控制条 | 388 × 100 | 横向 itemSpacing 12，CENTER |
| │　 ├ 次按钮 | 68 × 37 | radius 10，surface 底 + edge-2 描边 |
| │　 └ 主按钮-渐变 | 68 × 37 | radius 10，brand 实底（或 §6 渐变） |
| └ 测试结果卡 | 388 × 427 | radius 14，surface 底 + edge 描边，竖向 itemSpacing 14，pad 20 |
| 　　├ 面板标题 | — | 16px Space Grotesk Bold，ink |
| 　　├ 结果汇总行 | 185 × 23 | 含 AC 绿徽章 + 用例统计 |
| 　　└ 用例列表 | 348 × 316 | 竖向 itemSpacing 8（✓/✗ 列表） |

### 10.5 教程（深 `4:155` / 亮 `4:224`）

画布：1180 × 820　|　内容容器 y:56 / 高 725

| 组件 | 尺寸 (W×H) | 关键样式 |
| --- | --- | --- |
| 标题行 | 1052 × 69 | 竖向 itemSpacing 10（x:64） |
| ├ 页面标题 | — | 32px Space Grotesk Bold，ink |
| └ 页面副标题 | — | 15px Inter Regular，ink-2 |
| 分类筛选胶囊组 | 298 × 32 | 横向 itemSpacing 10（x:64, y:149） |
| ├ 分类胶囊-选中 | 54 × 32 | radius 999，brand 16% 底 + brand 60% 描边 |
| └ 分类胶囊 ×3 | 80×32 / 54×32 / 80×32 | radius 999，surface 底 + edge 描边 |
| 教程卡片列表 | 1052 × 448 | 竖向 itemSpacing 16（4 张） |
| 教程卡 ×4 | 1052 × 100 | 横向 CENTER，radius 14，itemSpacing 24，surface 底 + edge 描边 |
| ├ 章节徽章 | 60 × 28 | radius 999，brand 16% 底（「CH.01」，12px JetBrains Mono Medium 亮蓝） |
| ├ 主信息列 | 680 × 49 | 竖向 itemSpacing 6（x:108） |
| │　 ├ 教程标题 | — | 18px Space Grotesk Medium，ink |
| │　 └ 教程简介 | W 680 | 13px Inter Regular，行高 20px，ink-2 |
| └ 元信息行 | 172 × 23 | 横向 itemSpacing 14（x:812） |
| 　　├ 难度标签 | 44 × 23 | radius 999，--warn 16% 底 + --warn 60% 描边（中等橙） |
| 　　├ 时长 | — | 13px Inter Regular，ink-2（「12 分钟」） |
| 　　└ 阅读量 | — | 13px Inter Regular，ink-2（「2.3k 阅读」） |
