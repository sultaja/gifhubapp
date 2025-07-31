export interface CategoryTranslation {
  id: number;
  category_id: string;
  language_code: string;
  name: string;
}

export interface TagTranslation {
  id: number;
  tag_id: string;
  language_code: string;
  name: string;
}

export interface GifTranslation {
  id: number;
  gif_id: string;
  language_code: string;
  title: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  tag_translations: TagTranslation[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parent_id: string | null;
  category_translations: CategoryTranslation[];
}

export interface HierarchicalCategory extends Category {
  sub_categories: Category[];
}

export interface Gif {
  id:string;
  title: string;
  url: string;
  slug: string;
  tags: Tag[];
  category: Category | null;
  submittedBy?: string;
  is_featured?: boolean;
  gif_translations: GifTranslation[];
}

export interface SiteSettings {
    id: number;
    logo_url?: string | null;
    header_scripts?: string | null;
    footer_scripts?: string |null;
    page_titles?: Record<string, Record<string, string>> | null;
}

export interface ContentSection {
  id: number;
  section_key: string;
  language_code: string;
  title?: string | null;
  content?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
}

export interface UiTranslation {
  lang_code: string;
  translations: Record<string, any>;
}