export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  roleId: string;
  role?: { id: string; name: string };
  status?: number;
  createdAt?: string;
  permissions?: string[];
}

export interface ArticleData {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  coverImage: string | null;
  status: number;
  seoTitle: string | null;
  authorId: string;
  author?: UserInfo;
  categories?: CategoryData[];
  categoryIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sort: number;
  children?: CategoryData[];
  _count?: { articles: number };
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryTreeNode extends CategoryData {
  children: CategoryTreeNode[];
  level: number;
}

export interface RoleData {
  id: string;
  name: string;
  description: string | null;
  permissions?: { permissionId: string; permission?: PermissionData }[];
  permissionIds?: string[];
  _count?: { users: number };
  createdAt: string;
  updatedAt: string;
}

export interface PermissionData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  createdAt: string;
}

export interface ArticleFilter {
  search?: string;
  categoryId?: string;
  status?: string;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
