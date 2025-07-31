import { supabase } from "@/integrations/supabase/client";
import { 
  Gif, 
  Category, 
  Tag, 
  SiteSettings, 
  ContentSection, 
  UiTranslation, 
  ContactSubmission, 
  HierarchicalCategory 
} from "@/types";

const mapGifData = (gif: any): Gif => {
  if (!gif) return gif;
  const mapped = {
    ...gif,
    category: gif.categories || null,
    tags: gif.gif_tags?.map((gt: any) => gt.tags).filter(Boolean) || [],
    gif_translations: gif.gif_translations || [],
  };
  delete mapped.categories;
  delete mapped.gif_tags;
  return mapped;
};

export const getGifs = async (): Promise<Gif[]> => {
  const { data, error } = await supabase
    .from("gifs")
    .select('*, categories(*, category_translations(*)), gif_tags(tags(*, tag_translations(*))), gif_translations(*)')
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(mapGifData);
};

export const getPendingGifs = async (): Promise<Gif[]> => {
  const { data, error } = await supabase
    .from("gifs")
    .select('*, categories(*, category_translations(*)), gif_tags(tags(*, tag_translations(*))), gif_translations(*)')
    .eq('is_approved', false)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data.map(mapGifData);
};

export const getLatestGifs = async (limit: number = 12): Promise<Gif[]> => {
  const { data, error } = await supabase
    .from("gifs")
    .select('*, categories(*, category_translations(*)), gif_tags(tags(*, tag_translations(*))), gif_translations(*)')
    .eq('is_approved', true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data.map(mapGifData);
};

export const getFeaturedGifs = async (limit: number = 8): Promise<Gif[]> => {
  const { data, error } = await supabase
    .from("gifs")
    .select('*, categories(*, category_translations(*)), gif_tags(tags(*, tag_translations(*))), gif_translations(*)')
    .eq("is_featured", true)
    .eq('is_approved', true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data.map(mapGifData);
};

export const getGifBySlug = async (slug: string): Promise<Gif> => {
  const { data, error } = await supabase
    .from("gifs")
    .select('*, categories(*, category_translations(*)), gif_tags(tags(*, tag_translations(*))), gif_translations(*)')
    .eq("slug", slug)
    .eq('is_approved', true)
    .single();

  if (error) throw new Error(error.message);
  return mapGifData(data);
};

export const getGifsByCategorySlug = async (slug: string) => {
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*, category_translations(*)')
    .eq('slug', slug)
    .single();

  if (categoryError) throw new Error(categoryError.message);
  if (!category) return { category: null, gifs: [] };

  const { data: subCategories, error: subCategoriesError } = await supabase
    .from('categories')
    .select('id')
    .eq('parent_id', category.id);

  if (subCategoriesError) throw new Error(subCategoriesError.message);

  const categoryIds = [category.id, ...(subCategories?.map(sc => sc.id) || [])];

  const { data: gifs, error: gifsError } = await supabase
    .from('gifs')
    .select('*, categories!inner(*, category_translations(*)), gif_tags(tags(*, tag_translations(*))), gif_translations(*)')
    .in('category_id', categoryIds)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  if (gifsError) throw new Error(gifsError.message);

  return { category, gifs: gifs.map(mapGifData) };
};

export const getGifsByTagSlug = async (slug: string) => {
  const { data: tag, error: tagError } = await supabase
    .from('tags')
    .select('*, tag_translations(*)')
    .eq('slug', slug)
    .single();

  if (tagError) throw new Error(tagError.message);
  if (!tag) return { tag: null, gifs: [] };

  const { data, error: gifsError } = await supabase
    .from('gif_tags')
    .select('gifs!inner(*, categories(*, category_translations(*)), gif_tags(tags(*, tag_translations(*))), gif_translations(*))')
    .eq('tag_id', tag.id)
    .eq('gifs.is_approved', true);

  if (gifsError) throw new Error(gifsError.message);

  const gifs = data?.map((item: any) => item.gifs).filter(Boolean) as any[] || [];

  return { tag, gifs: gifs.map(mapGifData) };
};

export const searchGifs = async (searchTerm: string): Promise<Gif[]> => {
  const { data, error } = await supabase.rpc('search_gifs_advanced', { search_term: searchTerm });

  if (error) throw new Error(error.message);
  if (!data) return [];

  const gifIds = data.map((g: { id: string }) => g.id);

  const { data: gifs, error: gifsError } = await supabase
    .from('gifs')
    .select('*, categories(*, category_translations(*)), gif_tags(tags(*, tag_translations(*))), gif_translations(*)')
    .in('id', gifIds)
    .eq('is_approved', true);

  if (gifsError) throw new Error(gifsError.message);

  return gifs.map(mapGifData);
};

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("*, category_translations(*)").order("name");
  if (error) throw new Error(error.message);
  return data;
};

export const getHierarchicalCategories = async (): Promise<HierarchicalCategory[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*, category_translations(*)');

  if (error) throw new Error(error.message);

  const categories = data as Category[];
  const categoryMap = new Map<string, HierarchicalCategory>();
  const rootCategories: HierarchicalCategory[] = [];

  categories.forEach(category => {
    categoryMap.set(category.id, { ...category, sub_categories: [] });
  });

  categories.forEach(category => {
    if (category.parent_id && categoryMap.has(category.parent_id)) {
      const parent = categoryMap.get(category.parent_id);
      parent?.sub_categories.push(categoryMap.get(category.id)!);
    } else {
      rootCategories.push(categoryMap.get(category.id)!);
    }
  });

  return rootCategories;
};

export const getTags = async (): Promise<Tag[]> => {
  const { data, error } = await supabase.from("tags").select("*, tag_translations(*)").order("name");
  if (error) throw new Error(error.message);
  return data;
};

export const getStats = async () => {
  const { count: gifsCount, error: gifsError } = await supabase.from('gifs').select('*', { count: 'exact', head: true }).eq('is_approved', true);
  const { count: categoriesCount, error: categoriesError } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: tagsCount, error: tagsError } = await supabase.from('tags').select('*', { count: 'exact', head: true });

  if (gifsError || categoriesError || tagsError) {
    throw new Error(gifsError?.message || categoriesError?.message || tagsError?.message);
  }

  return { gifsCount, categoriesCount, tagsCount };
};

export const createGif = async (values: any) => {
  const { tags, ...gifData } = values;
  const { data, error } = await supabase.from('gifs').insert(gifData).select().single();
  if (error) throw new Error(error.message);

  if (tags && tags.length > 0) {
    const gifTags = tags.map((tagId: string) => ({ gif_id: data.id, tag_id: tagId }));
    const { error: tagsError } = await supabase.from('gif_tags').insert(gifTags);
    if (tagsError) throw new Error(tagsError.message);
  }
  return data;
};

export const updateGif = async (id: string, values: any) => {
  const { tags, ...gifData } = values;
  const { data, error } = await supabase.from('gifs').update(gifData).eq('id', id).select().single();
  if (error) throw new Error(error.message);

  const { error: deleteError } = await supabase.from('gif_tags').delete().eq('gif_id', id);
  if (deleteError) throw new Error(deleteError.message);

  if (tags && tags.length > 0) {
    const gifTags = tags.map((tagId: string) => ({ gif_id: data.id, tag_id: tagId }));
    const { error: tagsError } = await supabase.from('gif_tags').insert(gifTags);
    if (tagsError) throw new Error(tagsError.message);
  }
  return data;
};

export const deleteGif = async (id: string) => {
  const { error } = await supabase.from('gifs').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const deleteGifs = async (ids: string[]) => {
  const { error } = await supabase.from('gifs').delete().in('id', ids);
  if (error) throw new Error(error.message);
};

export const createCategory = async (values: Omit<Category, 'id'>) => {
  const { data, error } = await supabase.from('categories').insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateCategory = async (id: string, values: Partial<Category>) => {
  const { data, error } = await supabase.from('categories').update(values).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const deleteCategories = async (ids: string[]) => {
  const { error } = await supabase.from('categories').delete().in('id', ids);
  if (error) throw new Error(error.message);
};

export const createTag = async (values: Omit<Tag, 'id'>) => {
  const { data, error } = await supabase.from('tags').insert(values).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateTag = async (id: string, values: Partial<Tag>) => {
  const { data, error } = await supabase.from('tags').update(values).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteTag = async (id: string) => {
  const { error } = await supabase.from('tags').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const deleteTags = async (ids: string[]) => {
  const { error } = await supabase.from('tags').delete().in('id', ids);
  if (error) throw new Error(error.message);
};

export const getSiteSettings = async (): Promise<SiteSettings | null> => {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found is ok
    throw new Error(error.message);
  }
  return data;
};

export const updateSiteSettings = async (values: Partial<SiteSettings>) => {
  const { data, error } = await supabase.from('site_settings').upsert({ id: 1, ...values }).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const getContentSections = async (): Promise<ContentSection[]> => {
  const { data, error } = await supabase.from('content_sections').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const getContentSection = async (sectionKey: string, languageCode: string): Promise<ContentSection | null> => {
  const { data, error } = await supabase
    .from('content_sections')
    .select('*')
    .eq('section_key', sectionKey)
    .eq('language_code', languageCode)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data;
};

export const upsertContentSection = async (section: Partial<ContentSection>) => {
  const { data, error } = await supabase.from('content_sections').upsert(section, { onConflict: 'section_key, language_code' }).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const getUiTranslations = async (): Promise<UiTranslation[]> => {
  const { data, error } = await supabase.from('ui_translations').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const upsertUiTranslation = async (lang: string, content: object) => {
  const { data, error } = await supabase.from('ui_translations').upsert({ lang_code: lang, translations: content }, { onConflict: 'lang_code' }).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const upsertCategoryTranslations = async (translations: any[]) => {
  const { data, error } = await supabase.from('category_translations').upsert(translations, { onConflict: 'category_id, language_code' });
  if (error) throw new Error(error.message);
  return data;
};

export const upsertTagTranslations = async (translations: any[]) => {
  const { data, error } = await supabase.from('tag_translations').upsert(translations, { onConflict: 'tag_id, language_code' });
  if (error) throw new Error(error.message);
  return data;
};

export const upsertGifTranslations = async (translations: any[]) => {
  const { data, error } = await supabase.from('gif_translations').upsert(translations, { onConflict: 'gif_id, language_code' });
  if (error) throw new Error(error.message);
  return data;
};

export const getContactSubmissions = async (): Promise<ContactSubmission[]> => {
  const { data, error } = await supabase.from('contact_submissions').select('*').order('submitted_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data;
};

export const createContactSubmission = async (submission: Omit<ContactSubmission, 'id' | 'is_read' | 'submitted_at'>) => {
  const { data, error } = await supabase.from('contact_submissions').insert(submission).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateContactSubmission = async (id: number, values: Partial<ContactSubmission>) => {
  const { data, error } = await supabase.from('contact_submissions').update(values).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteContactSubmission = async (id: number) => {
  const { error } = await supabase.from('contact_submissions').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const deleteContactSubmissions = async (ids: number[]) => {
  const { error } = await supabase.from('contact_submissions').delete().in('id', ids);
  if (error) throw new Error(error.message);
};