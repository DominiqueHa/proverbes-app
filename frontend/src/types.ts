export type User = {
  id: number;
  pseudo: string;
};

export type Comment = {
  id: number;
  content: string;
  parent_id: number | null;
  created_at: string;
  author_pseudo: string;
  author_id: number;
};
