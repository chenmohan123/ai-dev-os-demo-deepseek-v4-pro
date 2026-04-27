import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { name: '查看仪表盘', code: 'dashboard:view', description: '查看管理后台仪表盘' },
  { name: '查看文章列表', code: 'article:list', description: '查看文章列表和搜索' },
  { name: '创建文章', code: 'article:create', description: '新建文章' },
  { name: '编辑文章', code: 'article:edit', description: '编辑已有文章' },
  { name: '删除文章', code: 'article:delete', description: '删除文章' },
  { name: '发布文章', code: 'article:publish', description: '发布或撤回文章' },
  { name: '查看分类', code: 'category:list', description: '查看分类列表' },
  { name: '创建分类', code: 'category:create', description: '新建分类' },
  { name: '编辑分类', code: 'category:edit', description: '编辑分类' },
  { name: '删除分类', code: 'category:delete', description: '删除分类' },
  { name: '排序分类', code: 'category:sort', description: '拖拽排序分类' },
  { name: '查看用户', code: 'user:list', description: '查看用户列表' },
  { name: '创建用户', code: 'user:create', description: '新建用户' },
  { name: '编辑用户', code: 'user:edit', description: '编辑用户信息' },
  { name: '删除用户', code: 'user:delete', description: '删除用户' },
  { name: '禁用用户', code: 'user:toggle-status', description: '启用或禁用用户' },
  { name: '查看角色', code: 'role:list', description: '查看角色列表' },
  { name: '创建角色', code: 'role:create', description: '新建角色' },
  { name: '编辑角色', code: 'role:edit', description: '编辑角色和权限' },
  { name: '删除角色', code: 'role:delete', description: '删除角色' },
  { name: '查看权限', code: 'permission:list', description: '查看权限列表' },
  { name: '创建权限', code: 'permission:create', description: '新建权限标识' },
  { name: '编辑权限', code: 'permission:edit', description: '编辑权限信息' },
  { name: '删除权限', code: 'permission:delete', description: '删除权限' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create permissions
  console.log('Creating permissions...');
  const createdPermissions: Record<string, string> = {};
  for (const perm of PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { code: perm.code },
      update: perm,
      create: perm,
    });
    createdPermissions[perm.code] = p.id;
  }

  // Create super admin role
  console.log('Creating roles...');
  const superAdminRole = await prisma.role.upsert({
    where: { name: '超级管理员' },
    update: { description: '拥有系统全部权限' },
    create: { name: '超级管理员', description: '拥有系统全部权限' },
  });

  // Create normal user role
  const normalRole = await prisma.role.upsert({
    where: { name: '普通用户' },
    update: { description: '基础访问权限' },
    create: { name: '普通用户', description: '基础访问权限' },
  });

  // Assign all permissions to super admin
  console.log('Assigning permissions to super admin...');
  await prisma.rolePermission.deleteMany({ where: { roleId: superAdminRole.id } });
  for (const permId of Object.values(createdPermissions)) {
    await prisma.rolePermission.create({
      data: { roleId: superAdminRole.id, permissionId: permId },
    });
  }

  // Assign basic permissions to normal user
  console.log('Assigning permissions to normal user...');
  await prisma.rolePermission.deleteMany({ where: { roleId: normalRole.id } });
  const basicPerms = ['dashboard:view', 'article:list', 'article:create', 'article:edit', 'category:list'];
  for (const code of basicPerms) {
    await prisma.rolePermission.create({
      data: { roleId: normalRole.id, permissionId: createdPermissions[code] },
    });
  }

  // Create default admin user
  console.log('Creating default admin...');
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: { roleId: superAdminRole.id },
    create: {
      name: '管理员',
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: superAdminRole.id,
      status: 1,
    },
  });

  // Create sample categories
  console.log('Creating sample categories...');
  const techCat = await prisma.category.upsert({
    where: { slug_parentId: { slug: 'technology', parentId: 'root' } },
    update: {},
    create: { name: '技术', slug: 'technology', sort: 0 },
  }).catch(() => prisma.category.findFirst({ where: { slug: 'technology', parentId: null } }));

  const frontendCat = await prisma.category.upsert({
    where: { slug_parentId: { slug: 'frontend', parentId: techCat!.id } },
    update: {},
    create: { name: '前端开发', slug: 'frontend', parentId: techCat!.id, sort: 0 },
  }).catch(() => prisma.category.findFirst({ where: { slug: 'frontend' } }));

  const backendCat = await prisma.category.upsert({
    where: { slug_parentId: { slug: 'backend', parentId: techCat!.id } },
    update: {},
    create: { name: '后端开发', slug: 'backend', parentId: techCat!.id, sort: 1 },
  }).catch(() => prisma.category.findFirst({ where: { slug: 'backend' } }));

  const designCat = await prisma.category.upsert({
    where: { slug_parentId: { slug: 'design', parentId: 'root' } },
    update: {},
    create: { name: '设计', slug: 'design', sort: 1 },
  }).catch(() => prisma.category.findFirst({ where: { slug: 'design', parentId: null } }));

  const lifeCat = await prisma.category.upsert({
    where: { slug_parentId: { slug: 'life', parentId: 'root' } },
    update: {},
    create: { name: '生活', slug: 'life', sort: 2 },
  }).catch(() => prisma.category.findFirst({ where: { slug: 'life', parentId: null } }));

  // Create sample articles
  console.log('Creating sample articles...');
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  if (!adminUser) throw new Error('Admin user not found');

  const sampleArticles = [
    {
      title: '使用 Next.js 14 构建现代 Web 应用',
      slug: 'building-modern-web-apps-with-nextjs-14',
      content: `# 使用 Next.js 14 构建现代 Web 应用

Next.js 14 带来了许多令人兴奋的新特性，让构建现代 Web 应用变得更加简单。

## App Router

App Router 是 Next.js 13 引入的新路由系统，在 14 版本中已经稳定。它基于 React Server Components，提供了更好的性能和开发体验。

### 文件约定

- \`page.tsx\` — 页面组件
- \`layout.tsx\` — 布局组件
- \`loading.tsx\` — 加载状态
- \`error.tsx\` — 错误边界
- \`not-found.tsx\` — 404 页面

## Server Actions

Server Actions 允许你在服务端执行表单提交和数据修改，无需创建额外的 API 路由。

## 总结

Next.js 14 是一个成熟稳定的版本，非常适合用来构建生产级应用。其全栈能力让前端开发者也能轻松处理后端逻辑。`,
      summary: '探索 Next.js 14 的新特性，包括 App Router、Server Actions 和性能优化。',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
      status: 1,
      seoTitle: 'Next.js 14 现代 Web 应用开发指南',
    },
    {
      title: 'Tailwind CSS 设计系统实践',
      slug: 'tailwind-css-design-system',
      content: `# Tailwind CSS 设计系统实践

Tailwind CSS 是一个实用优先的 CSS 框架，它让构建自定义设计系统变得异常简单。

## 为什么选择 Tailwind CSS

1. **原子化 CSS** — 每个类只做一件事，组合起来完成复杂设计
2. **设计约束** — 预定义的颜色、间距、字号强制设计一致性
3. **响应式** — 内置的断点系统让响应式设计变得轻松
4. **暗色模式** — \`dark:\` 前缀让暗色模式支持零成本

## 构建调色板

\`\`\`js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#6366f1',
          600: '#4f46e5',
        }
      }
    }
  }
}
\`\`\`

## 组件化设计

将可复用的样式提取为组件，在保持灵活性的同时减少重复。`,
      summary: '通过 Tailwind CSS 建立一致的设计系统，提高开发效率和设计质量。',
      coverImage: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=800&h=400&fit=crop',
      status: 1,
      seoTitle: 'Tailwind CSS 设计系统实践指南',
    },
    {
      title: 'TypeScript 高级类型技巧',
      slug: 'typescript-advanced-types',
      content: `# TypeScript 高级类型技巧

TypeScript 的类型系统非常强大，掌握高级类型技巧能让你的代码更加安全和优雅。

## 条件类型

\`\`\`typescript
type IsString<T> = T extends string ? true : false;
type A = IsString<'hello'>; // true
type B = IsString<42>;      // false
\`\`\`

## 模板字面量类型

\`\`\`typescript
type EventName<T extends string> = \`on\${Capitalize<T>}\`;
type Click = EventName<'click'>; // 'onClick'
\`\`\`

## 映射类型

\`\`\`typescript
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};
\`\`\`

TypeScript 的类型体操虽然有时候让人头疼，但它带来的安全性提升是实打实的。`,
      summary: '深入 TypeScript 类型系统，学习条件类型、模板字面量类型等高级技巧。',
      coverImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
      status: 1,
      seoTitle: 'TypeScript 高级类型编程技巧',
    },
    {
      title: '设计中的留白艺术',
      slug: 'art-of-whitespace-in-design',
      content: `# 设计中的留白艺术

留白，或者叫负空间，是设计中最被低估的元素之一。

## 为什么留白很重要

- **提升可读性** — 合适的行间距和段落间距让阅读更轻松
- **聚焦重点** — 通过周围的空间来突出核心内容
- **传递品质感** — 奢侈品牌大量使用留白来营造高级感

## 留白的黄金法则

> 在设计中使用留白时，宁可多留一些。

一个好的设计需要呼吸的空间。不要让内容过于拥挤。`,
      summary: '探索 UI 设计中留白的运用技巧，让界面呼吸起来。',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=400&fit=crop',
      status: 1,
      seoTitle: 'UI 设计中的留白艺术与技巧',
    },
    {
      title: 'Prisma ORM 入门指南',
      slug: 'prisma-orm-getting-started',
      content: `# Prisma ORM 入门指南

Prisma 是下一代 Node.js ORM，提供了类型安全的数据库访问。

## 安装

\`\`\`bash
npm install @prisma/client
npm install -D prisma
\`\`\`

## 定义数据模型

\`\`\`prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String
  posts Post[]
}

model Post {
  id       String @id @default(cuid())
  title    String
  content  String
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
\`\`\`

## CRUD 操作

\`\`\`typescript
const users = await prisma.user.findMany({
  include: { posts: true }
});
\`\`\`

Prisma 让数据库操作变得安全和高效。`,
      summary: '从零开始学习 Prisma ORM，构建类型安全的数据库应用。',
      coverImage: 'https://images.unsplash.com/photo-1489875347897-49f64b51c1f8?w=800&h=400&fit=crop',
      status: 1,
      seoTitle: 'Prisma ORM 从入门到实践',
    },
  ];

  // Delete existing articles first
  await prisma.articleCategory.deleteMany();
  await prisma.article.deleteMany();

  for (const articleData of sampleArticles) {
    const article = await prisma.article.create({
      data: {
        ...articleData,
        authorId: adminUser.id,
      },
    });

    // Assign categories to articles
    if (article.slug.includes('nextjs') || article.slug.includes('tailwind') || article.slug.includes('typescript') || article.slug.includes('prisma')) {
      const frontend = await prisma.category.findFirst({ where: { slug: 'frontend' } });
      if (frontend) {
        await prisma.articleCategory.create({
          data: { articleId: article.id, categoryId: frontend.id },
        });
      }
    }
    if (article.slug.includes('design') || article.slug.includes('whitespace')) {
      const design = await prisma.category.findFirst({ where: { slug: 'design' } });
      if (design) {
        await prisma.articleCategory.create({
          data: { articleId: article.id, categoryId: design.id },
        });
      }
    }
  }

  console.log('✅ Seed complete!');
  console.log('   Default admin: admin@example.com / admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
