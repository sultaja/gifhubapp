export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface Gif {
  id: string;
  title: string;
  url: string;
  slug: string;
  tags: Tag[];
  category: Category | null;
  submittedBy?: string;
  is_featured?: boolean;
}

export interface SiteSettings {
    id: number;
    logo_url?: string | null;
    header_scripts?: string | null;
    footer_scripts?: string |null;
    page_titles?: Record<string, string> | null;
}