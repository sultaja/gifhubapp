export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Gif {
  id: string;
  title: string;
  url: string;
  slug: string;
  tags: Tag[];
  category: Category | null;
  submittedBy?: string;
}