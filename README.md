> 本项目由 **DeepSeek v4 Pro** 使用 `.ai-dev-os` 基于 `PROMPT.md` 提示词自动生成。

# DevHub CMS — 现代内容管理系统

基于 Next.js 14 构建的全栈内容管理系统，包含面向访客的响应式官网和功能完善的管理后台。

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06b6d4?logo=tailwindcss)
![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?logo=prisma)
![SQLite](https://img.shields.io/badge/SQLite-3-blue?logo=sqlite)

## 功能概览

### 官网（前台）
- 精美的 Hero 区域，现代渐变设计
- 文章卡片网格展示，响应式适配
- 多级分类筛选、文章搜索、分页
- Markdown 渲染的文章详情页
- 文章目录（TOC）侧边栏
- 面包屑导航、社交分享按钮
- PC/移动端完美适配，毛玻璃导航栏

### 管理后台
- 独立管理布局（侧边栏 + 顶栏），亮色/暗色模式
- 精美的登录/注册页面（渐变背景 + 毛玻璃卡片）
- 仪表盘：统计卡片、最近文章
- 文章管理：Markdown 编辑器（实时预览/全屏）、级联分类选择、SEO 设置
- 分类管理：无限层级树形结构，支持拖拽排序
- 用户管理：CRUD、角色分配、状态切换、密码重置
- 角色管理：权限分配（分组勾选）
- 权限管理：自定义权限标识，API + 前端双层控制

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) |
| 语言 | TypeScript |
| 数据库 | SQLite + Prisma ORM |
| 样式 | Tailwind CSS |
| 认证 | JWT (jose) + bcryptjs |
| 表单校验 | Zod |
| Markdown | @uiw/react-md-editor + react-markdown |
| 图标 | lucide-react |
| 拖拽 | @dnd-kit |

## 快速开始

### 前提条件
- Node.js 18+
- npm 9+

### 安装与运行

```bash
# 1. 安装依赖、生成 Prisma Client、建表、导入种子数据
npm run setup

# 2. 启动开发服务器
npm run dev
```

启动后访问：
- **官网**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin/login

### 默认管理员账户

| 邮箱 | 密码 | 角色 |
|------|------|------|
| admin@example.com | admin123 | 超级管理员 |

> 注册新账号默认获得「普通用户」角色，仅可浏览后台，无管理权限。

## 项目结构

```
├── prisma/
│   ├── schema.prisma    # 数据库模型定义（7张表）
│   └── seed.ts          # 种子数据（管理员、权限、示例文章）
├── src/
│   ├── app/
│   │   ├── (site)/      # 官网前台路由
│   │   ├── (admin)/     # 管理后台路由
│   │   └── api/         # REST API 路由
│   ├── components/
│   │   ├── ui/          # 通用 UI 组件
│   │   ├── site/        # 官网组件
│   │   └── admin/       # 后台组件
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 工具库（认证、权限、数据库等）
│   ├── middleware.ts    # 边缘中间件（JWT校验）
│   └── types/           # TypeScript 类型定义
├── package.json
├── tailwind.config.ts
└── next.config.js
```

## 权限系统

系统内置 24 个权限标识，分为 6 个模块：

| 模块 | 权限示例 | 说明 |
|------|---------|------|
| 仪表盘 | `dashboard:view` | 查看仪表盘 |
| 文章 | `article:create`, `article:edit`, `article:delete`, `article:publish` | 文章管理 |
| 分类 | `category:create`, `category:edit`, `category:delete`, `category:sort` | 分类管理 |
| 用户 | `user:create`, `user:edit`, `user:delete`, `user:toggle-status` | 用户管理 |
| 角色 | `role:create`, `role:edit`, `role:delete` | 角色管理 |
| 权限 | `permission:create`, `permission:edit`, `permission:delete` | 权限管理 |

权限控制采用双层防御：
- **API 层**：每个受保护接口校验权限，无权限返回 403
- **前端层**：`usePermission('article:create')` 控制菜单项和按钮的显隐

## 数据库

使用 SQLite，数据库文件存储在 `prisma/dev.db`。无需额外安装数据库服务。

常用 Prisma 命令：
```bash
npx prisma studio        # 打开数据库管理界面
npx prisma db push       # 同步 schema 到数据库
npx prisma db seed       # 重新导入种子数据
```

## 可用脚本

```bash
npm run dev       # 启动开发服务器
npm run build     # 构建生产版本
npm run start     # 启动生产服务器
npm run setup     # 一键安装（install + generate + push + seed）
npm run db:push   # 同步数据库
npm run db:seed   # 导入种子数据
npm run db:studio # 打开 Prisma Studio
```

## 部署

```bash
npm run build
npm run start
```

生产环境请修改 `.env` 中的 `JWT_SECRET` 为安全的随机字符串。

## License

MIT
