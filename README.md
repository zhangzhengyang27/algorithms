# 算法可视化学习平台

> 一个面向个人学习者的算法可视化学习平台，支持可视化、Monaco 代码编辑器、Markdown 教程和题解库。

## 功能特性

- **90+ 交互式可视化面板** - 覆盖排序 / 搜索 / 数组 / 链表 / 栈 / 队列 / 树（BST/AVL/红黑/B 树/线段树/…）/ 图论 / 动态规划 / 字符串 / 数论 / 计算几何等（下两行仅为代表性子集）
- **排序算法可视化** - 冒泡、快排、归并、堆排等排序算法的动画演示
- **搜索算法可视化** - 二分查找、双指针等搜索类算法的动态演示
- **Monaco 代码编辑器** - 支持语法高亮和在线运行
- **算法教程** - Markdown 格式的详细教程
- **题目练习** - LeetCode 风格题目
- **学习进度追踪** - 记录刷题进度

## 技术栈

### 前端
- Next.js 15 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Zustand (状态管理)

### 后端
- NestJS 11
- Node.js 22
- Prisma 6
- PostgreSQL 17

## 快速开始

### 安装依赖

```bash
# 前端
cd frontend
npm install

# 后端
cd backend
npm install
```

### 配置数据库

1. 确保 PostgreSQL 17 已运行
2. 创建数据库：
```bash
createdb algo_platform
```

3. 运行迁移和种子数据：
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

> 教程内容通过 `npx ts-node prisma/sync-tutorials.ts` 从 `frontend/src/app/tutorials/*.md` 同步进数据库（git-as-CMS 模式）；前端页面直接读取各路由下的 `.tsx` 教程页，二者相互独立。新增教程需在 `sync-tutorials.ts` 的 `CATEGORY_MAP` / `TUTORIAL_ORDER` 中登记。

### 启动开发服务器

```bash
# 终端 1: 后端
cd backend
npm run dev

# 终端 2: 前端
cd frontend
npm run dev
```

访问 http://localhost:4000

## 项目结构

```
algorithms/
├── frontend/                    # Next.js 前端
│   ├── src/
│   │   ├── app/               # 页面
│   │   │   ├── tutorials/     # 教程页面
│   │   │   ├── problems/      # 题目页面
│   │   │   ├── visualizer/     # 可视化页面
│   │   │   └── progress/       # 进度页面
│   │   ├── components/         # 组件
│   │   ├── lib/
│   │   │   ├── algorithms/     # 算法实现
│   │   │   └── visualizers/    # 可视化引擎
│   │   └── store/              # Zustand 状态
│   └── package.json
│
├── backend/                     # NestJS 后端
│   ├── src/
│   │   ├── modules/           # 业务模块
│   │   │   ├── auth/          # 认证
│   │   │   ├── tutorials/      # 教程
│   │   │   ├── problems/       # 题目
│   │   │   ├── categories/     # 分类
│   │   │   ├── progress/       # 进度
│   │   │   └── notes/          # 笔记
│   │   └── prisma/            # Prisma 服务
│   ├── prisma/
│   │   ├── schema.prisma      # 数据库 Schema
│   │   └── seed.ts            # 种子数据
│   └── package.json
│
└── docs/                      # 设计文档
```

## 教程内容

已导入以下教程：

- 排序算法：快速排序、归并排序
- 搜索算法：二分查找
- 数据结构：二叉树、二分搜索树、链表、队列、栈、堆、哈希表
- 高级结构：并查集、线段树、Trie
- 基础概念：递归

## 演示账号

```
邮箱: demo@example.com
密码: demo123
```

## API 文档

后端启动后访问：http://localhost:40001/api/docs

> 前端通过 Next.js 重写代理把 `/api/v1/*` 转发到后端 `:40001`，浏览器只需访问前端 `:4000`，无需单独配置跨域。

## 发布部署

完整的构建、启动、环境变量、数据库迁移/备份与内容系统说明见 **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**。发布前务必先读，尤其注意：**不要用 `prisma migrate dev`（会触发 reset 清空数据），改 schema 请用 `prisma db push`**。

## 许可证

MIT
