export type User = {
  id: number;
  pseudo: string;
  role: 'user' | 'admin';
};

export type Comment = {
  id: number;
  content: string;
  parent_id: number | null;
  created_at: string;
  author_pseudo: string;
  author_id: number;
  likes_count?: number;
  user_liked?: boolean;
};

export type AdminUser = {
  id: number;
  pseudo: string;
  role: 'user' | 'admin';
  created_at: string;
  comments_count: number;
};
