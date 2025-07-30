import { supabase } from "@/integrations/supabase/client";
import { Gif, Category, Tag } from "@/types";

// The base query for fetching GIFs with their related category and tags
const BASE_GIF_QUERY = "id, title, url, slug, category:categories!inner(id, name, slug), tags(id, name, slug)";

// Fetch all categories
export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("*").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

// Fetch all tags
export const getTags = async (): Promise<Tag[]> => {
    const { data, error } = await supabase.from("tags").select("*").order("name", { ascending: true });
    if (error) throw new Error(error.message);
    return data || [];
};

// Fetch all GIFs for admin
export const getGifs = async (): Promise<Gif[]> => {
  const { data, error } = await supabase
    .from("gifs")
    .select(BASE_GIF_QUERY)
    .order("created_at", { ascending: false });
    
  if (error) throw new Error(error.message);
  return (data as any) || [];
};

// Fetch a limited number of featured GIFs
export const getFeaturedGifs = async (limit = 12): Promise<Gif[]> => {
  const { data, error } = await supabase
    .from("gifs")
    .select(BASE_GIF_QUERY)
    .limit(limit)
    .order("created_at", { ascending: false });
    
  if (error) throw new Error(error.message);
  return (data as any) || [];
};

// Fetch a single GIF by its slug
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

// Fetch GIFs belonging to a specific category slug
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

// Fetch GIFs associated with a specific tag slug
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

// Search for GIFs by a query string
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

// Get stats for admin dashboard
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