export type ArticleStatus = "draft" | "pending" | "published" | "rejected";

export type UserRole = "user" | "editor" | "admin";

export interface UserPublic {
  id: number;
  username: string;
  full_name?: string | null;
  bio?: string | null;
}

export interface UserRead extends UserPublic {
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface User extends UserPublic {
  email: string;
  full_name: string | null;
  bio: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface CategoryRead {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
}

export interface CategoryDetail extends CategoryRead {
  description?: string | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface TagWithCount extends Tag {
  articles_count: number;
}

export interface ArticleListItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  cover_image_url?: string | null;
  status: ArticleStatus;
  views_count: number;
  published_at?: string | null;
  is_featured: boolean;
  created_at: string;
  author: UserPublic;
  category: CategoryRead;
  tags: Tag[];
}

export interface ArticleRead extends ArticleListItem {
  content: string;
  rejection_reason?: string | null;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export type Page<T> = PaginatedResponse<T>;

export interface Token {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
  full_name?: string | null;
}

export interface ArticleCreate {
  title: string;
  summary: string;
  content: string;
  category_id: number;
  tags?: string[];
}

export interface CategoryCreate {
  name: string;
  description?: string;
}

export interface HealthResponse {
  status: string;
  version: string;
}

export interface AdminStats {
  users: number;
  active_users: number;
  articles_total: number;
  articles_draft: number;
  articles_pending: number;
  articles_published: number;
  articles_rejected: number;
  total_views: number;
  categories: number;
  tags: number;
}
