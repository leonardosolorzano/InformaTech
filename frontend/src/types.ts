export const CATEGORIES = [
  "Inteligencia Artificial",
  "Ciberseguridad",
  "Cloud Computing",
  "Blockchain",
  "DevOps",
  "Desarrollo Web",
  "Data Science",
  "IoT",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Article {
  id: number;
  title: string;
  content: string;
  author_name: string;
  minutes_to_read: number;
  fecha_publication: string;
  user_id: number;
  image_url?: string | null;
  category?: string | null;
  author_image_url?: string | null;
}

export interface ArticleFormData {
  title: string;
  content: string;
  minutes_to_read: number;
  fecha_publication: string;
  category?: string | null;
  image_url?: string | null;
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  image_url?: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  full_name: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}
