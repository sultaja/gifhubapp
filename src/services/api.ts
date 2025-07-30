import { supabase } from "@/integrations/supabase/client";
import { Gif, Category, Tag } from "@/types";

// The base query for fetching GIFs with their related category and tags
const BASE_GIF_QUERY = "id, title, url, slug, category:categories(id, name, slug), tags(id, name, slug)";

// --- CATEGORY API ---
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
    const { data, error } = await supabase.from('categories').insert(category).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
};

export const deleteCategory = async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw new Error(error.message);
};


// --- TAG API ---
export const getTags = async (): Promise<Tag[]> => {
    const { data, error } = await supabase.from("tags").select("*").order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
};

export const createTag = async (tag: Omit<Tag, 'id'>): Promise<Tag> => {
    const { data, error } = await supabase.from('tags').insert(tag).select().single();
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

// --- GIF API ---
export const getGifs = async (): Promise<Gif[]> => {
  const { data, error } = await supabase
    .from("gifs")
    .select(BASE_GIF_QUERY)
    .order("created_at", { ascending: false });
    
  if (error) throw new Error(error.message);
  return (data as any) || [];
};

export const getFeaturedGifs = async (limit = 12): Promise<Gif[]> => {
  const { data, error } = await supabase
    .from("gifs")
    .select(BASE_GIF_QUERY)
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
    const { data: category, error: categoryError } = await supabase.from('categories').select('*').eq('slug', slug).single();
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
    const { data: tag, error: tagError } = await supabase.from('tags').select('*').eq('slug', slug).single();
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
    const { data, error } = await supabase
        .from('gifs')
        .select(BASE_GIF_QUERY)
        .textSearch('title', `'${query}'`, { type: 'websearch' });

    if (error) {
        console.error("Error searching gifs:", error);
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