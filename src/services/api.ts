import { supabase } from "@/integrations/supabase/client";
import { Gif, Category, Tag, SiteSettings, CategoryTranslation, TagTranslation, GifTranslation, ContentSection, HierarchicalCategory, UiTranslation, ContactSubmission } from "@/types";
import { GifFormValues } from "@/components/admin/GifDialog";

// The base query for fetching GIFs with their related category and tags, now including translations
const BASE_GIF_QUERY = "id, title, url, slug, is_featured, gif_translations(*), category:categories(id, name, slug, icon, parent_id, category_translations(*)), tags(id, name, slug, tag_translations(*))";
const BASE_CATEGORY_QUERY = "*, icon, parent_id, category_translations(*)";

// --- TRANSLATION API ---
export const upsertCategoryTranslations = async (translations: Partial<CategoryTranslation>[]) => {
    const { error } = await supabase.from('category_translations').upsert(translations);
    if (error) throw new Error(error.message);
};

export const upsertTagTranslations = async (translations: Partial<TagTranslation>[]) => {
    const { error } = await supabase.from('tag_translations').upsert(translations);
    if (error) throw new Error(error.message);
};

export const upsertGifTranslations = async (translations: Partial<GifTranslation>[]) => {
    const { error } = await supabase.from('gif_translations').upsert(translations);
    if (error) throw new Error(error.message);
};


// --- CATEGORY API ---
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select(BASE_CATEGORY_QUERY).order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const getHierarchicalCategories = async (): Promise<HierarchicalCategory[]> => {
  const { data, error } = await supabase.from("categories").select(BASE_CATEGORY_QUERY).order("name", { ascending: true });
  if (error) throw new Error(error.message);
  
  const categories = data || [];
  const categoryMap = new Map(categories.map(cat => [cat.id, { ...cat, sub_categories: [] }]));
  const hierarchicalCategories: HierarchicalCategory[] = [];

  for (const category of categories) {
    const mappedCategory = categoryMap.get(category.id)!;
    if (category.parent_id && categoryMap.has(category.parent_id)) {
      categoryMap.get(category.parent_id)!.sub_categories.push(mappedCategory);
    } else {
      hierarchicalCategories.push(mappedCategory);
    }
  }
  
  return hierarchicalCategories;
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
    const { category_translations, ...categoryDataForDb } = category;
    const { data, error } = await supabase.from('categories').insert(categoryDataForDb).select(BASE_CATEGORY_QUERY).single();
    if (error) throw new Error(error.message);
    return data;
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select(BASE_CATEGORY_QUERY).single();
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


// --- TAG API ---
export const getTags = async (): Promise<Tag[]> => {
    const { data, error } = await supabase.from("tags").select("*, tag_translations(*)").order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
};

export const createTag = async (tag: Omit<Tag, 'id'>): Promise<Tag> => {
    const { tag_translations, ...tagDataForDb } = tag;
    const { data, error } = await supabase.from('tags').insert(tagDataForDb).select('*, tag_translations(*)').single();
    if (error) throw new Error(error.message);
    return data;
};

export const updateTag = async (id: string, updates: Partial<Tag>): Promise<Tag> => {
    const { data, error } = await supabase.from('tags').update(updates).eq('id', id).select().single();
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

// --- GIF API ---
export const getGifs = async (): Promise<Gif[]> => {
  const { data, error } = await supabase
    .from("gifs")
    .select(BASE_GIF_QUERY)
    .order("created_at", { ascending: false });
    
  if (error) throw new Error(error.message);
  return (data as any) || [];
};

export const createGif = async (values: GifFormValues) => {
  const { data: gifData, error: gifError } = await supabase
    .from("gifs")
    .insert({
      title: values.title,
      url: values.url,
      slug: values.slug,
      category_id: values.category_id,
      is_featured: values.is_featured,
    })
    .select()
    .single();

  if (gifError) throw new Error(gifError.message);
  if (!gifData) throw new Error("Failed to create GIF.");

  const gifTags = values.tags.map(tagId => ({
    gif_id: gifData.id,
    tag_id: tagId,
  }));

  const { error: tagsError } = await supabase.from("gif_tags").insert(gifTags);

  if (tagsError) {
    await supabase.from("gifs").delete().eq("id", gifData.id);
    throw new Error(`Failed to associate tags: ${tagsError.message}`);
  }

  return gifData;
};

export const updateGif = async (id: string, values: GifFormValues) => {
  const { data: gifData, error: gifError } = await supabase
    .from("gifs")
    .update({
      title: values.title,
      url: values.url,
      slug: values.slug,
      category_id: values.category_id,
      is_featured: values.is_featured,
    })
    .eq("id", id)
    .select()
    .single();

  if (gifError) throw new Error(gifError.message);
  if (!gifData) throw new Error("Failed to update GIF.");

  const { error: deleteTagsError } = await supabase.from("gif_tags").delete().eq("gif_id", id);
  if (deleteTagsError) throw new Error(`Failed to update tags (delete step): ${deleteTagsError.message}`);

  const gifTags = values.tags.map(tagId => ({
    gif_id: id,
    tag_id: tagId,
  }));

  if (gifTags.length > 0) {
      const { error: insertTagsError } = await supabase.from("gif_tags").insert(gifTags);
      if (insertTagsError) throw new Error(`Failed to update tags (insert step): ${insertTagsError.message}`);
  }

  return gifData;
};

export const deleteGif = async (id: string) => {
  const { error: tagsError } = await supabase.from("gif_tags").delete().eq("gif_id", id);
  if (tagsError) throw new Error(`Failed to delete GIF tag associations: ${tagsError.message}`);

  const { error: gifError } = await supabase.from("gifs").delete().eq("id", id);
  if (gifError) throw new Error(`Failed to delete GIF: ${gifError.message}`);
};

export const deleteGifs = async (ids: string[]) => {
    const { error: tagsError } = await supabase.from("gif_tags").delete().in("gif_id", ids);
    if (tagsError) throw new Error(`Failed to delete GIF tag associations: ${tagsError.message}`);

    const { error: gifError } = await supabase.from("gifs").delete().in("id", ids);
    if (gifError) throw new Error(`Failed to delete GIFs: ${gifError.message}`);
};

export const getLatestGifs = async (limit = 12): Promise<Gif[]> => {
  const { data, error } = await supabase
    .from("gifs")
    .select(BASE_GIF_QUERY)
    .limit(limit)
    .order("created_at", { ascending: false });
    
  if (error) throw new Error(error.message);
  return (data as any) || [];
};

export const getFeaturedGifs = async (limit = 8): Promise<Gif[]> => {
  const { data, error } = await supabase
    .from("gifs")
    .select(BASE_GIF_QUERY)
    .eq('is_featured', true)
    .limit(limit)
    .order("created_at", { ascending: false });
    
  if (error) throw new Error(error.message);
  return (data as any) || [];
};

export const getGifBySlug = async (slug: string): Promise<Gif | null> => {
  const { data, error } = await supabase
    .from("gifs")
    .select(BASE_GIF_QUERY)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching GIF by slug:", error);
    return null;
  }
  return data as any;
};

export const getGifsByCategorySlug = async (slug: string): Promise<{ category: Category | null, gifs: Gif[] }> => {
    const { data: category, error: categoryError } = await supabase.from('categories').select(BASE_CATEGORY_QUERY).eq('slug', slug).single();
    if (categoryError || !category) {
        throw new Error(categoryError?.message || "Category not found");
    }

    const { data: gifs, error: gifsError } = await supabase
        .from('gifs')
        .select(BASE_GIF_QUERY)
        .eq('category_id', category.id);
    
    if (gifsError) {
        throw new Error(gifsError.message);
    }

    return { category, gifs: (gifs as any) || [] };
};

export const getGifsByTagSlug = async (slug: string): Promise<{ tag: Tag | null, gifs: Gif[] }> => {
    const { data: tag, error: tagError } = await supabase.from('tags').select('*, tag_translations(*)').eq('slug', slug).single();
    if (tagError || !tag) {
        throw new Error(tagError?.message || "Tag not found");
    }

    const { data: gifTags, error: gifsError } = await supabase
        .from('gif_tags')
        .select(`gif:gifs!inner(${BASE_GIF_QUERY})`)
        .eq('tag_id', tag.id);

    if (gifsError) {
        throw new Error(gifsError.message);
    }

    const gifs = gifTags?.map((item: any) => item.gif) || [];

    return { tag, gifs };
};

export const searchGifs = async (query: string): Promise<Gif[]> => {
    if (!query) return [];
    
    const { data: rpcData, error: rpcError } = await supabase.rpc('search_gifs_advanced', { search_term: query });

    if (rpcError) {
        console.error("Error searching gifs via RPC:", rpcError);
        throw new Error(rpcError.message);
    }

    const gifIds = rpcData.map((item: { id: string }) => item.id);

    if (gifIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from('gifs')
        .select(BASE_GIF_QUERY)
        .in('id', gifIds);

    if (error) {
        console.error("Error fetching searched gifs:", error);
        throw new Error(error.message);
    }
    
    return (data as any) || [];
};

// --- STATS API ---
export const getStats = async () => {
    const { count: gifsCount, error: gifsError } = await supabase.from('gifs').select('*', { count: 'exact', head: true });
    const { count: categoriesCount, error: categoriesError } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    const { count: tagsCount, error: tagsError } = await supabase.from('tags').select('*', { count: 'exact', head: true });

    if (gifsError || categoriesError || tagsError) {
        console.error(gifsError || categoriesError || tagsError);
        throw new Error("Failed to fetch stats");
    }

    return { gifsCount, categoriesCount, tagsCount };
}

// --- SITE SETTINGS API ---
export const getSiteSettings = async (): Promise<SiteSettings | null> => {
    const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

    if (error) {
        console.error("Error fetching site settings:", error);
        return null;
    }
    return data;
};

export const updateSiteSettings = async (settings: Partial<SiteSettings>): Promise<SiteSettings> => {
    const { data, error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', 1)
        .select()
        .single();

    if (error) {
        console.error("Error updating site settings:", error);
        throw new Error(error.message);
    }
    return data;
};

// --- CONTENT SECTIONS API ---
export const getContentSections = async (): Promise<ContentSection[]> => {
    const { data, error } = await supabase.from('content_sections').select('*');
    if (error) throw new Error(error.message);
    return data || [];
};

export const getContentSection = async (sectionKey: string, languageCode: string): Promise<ContentSection | null> => {
    const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .eq('section_key', sectionKey)
        .eq('language_code', languageCode)
        .maybeSingle();
    if (error) {
        console.error(`Error fetching content for ${sectionKey} [${languageCode}]`, error);
        return null;
    }
    return data;
};

export const upsertContentSection = async (section: Partial<ContentSection>): Promise<ContentSection> => {
    const { data, error } = await supabase
        .from('content_sections')
        .upsert(section, { onConflict: 'section_key, language_code' })
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

// --- UI TRANSLATIONS API ---
export const getUiTranslations = async (): Promise<UiTranslation[]> => {
    const { data, error } = await supabase.from('ui_translations').select('*');
    if (error) throw new Error(error.message);
    return data || [];
};

export const upsertUiTranslation = async (lang_code: string, translations: object): Promise<UiTranslation> => {
    const { data, error } = await supabase
        .from('ui_translations')
        .upsert({ lang_code, translations })
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data;
};

// --- CONTACT SUBMISSIONS API ---
export const getContactSubmissions = async (): Promise<ContactSubmission[]> => {
    const { data, error } = await supabase.from('contact_submissions').select('*').order('submitted_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
};

export const createContactSubmission = async (submission: Omit<ContactSubmission, 'id' | 'is_read' | 'submitted_at'>): Promise<ContactSubmission> => {
    const { data, error } = await supabase.from('contact_submissions').insert(submission).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const updateContactSubmission = async (id: number, updates: Partial<ContactSubmission>): Promise<ContactSubmission> => {
    const { data, error } = await supabase.from('contact_submissions').update(updates).eq('id', id).select().single();
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