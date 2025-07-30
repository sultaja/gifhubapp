import { supabase } from "@/integrations/supabase/client";
import { Gif, Category, Tag } from "@/types";

// The base query for fetching GIFs with their related category and tags
const BASE_GIF_QUERY = "id, title, url, slug, category:categories(id, name, slug), tags:tags(id, name, slug)";

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

// Fetch a limited number of featured GIFs
export const getFeaturedGifs = async (limit = 12): Promise<Gif[]> => {
  const { data, error } = await supabase
    .from("gifs")
    .select(BASE_GIF_QUERY)
    .limit(limit)
    .order("created_at", { ascending: false });
    
  if (error) throw new Error(error.message);
  return data || [];
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
  return data;
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

    return { category, gifs: gifs || [] };
};

// Fetch GIFs associated with a specific tag slug
export const getGifsByTagSlug = async (slug: string): Promise<{ tag: Tag | null, gifs: Gif[] }> => {
    const { data: tag, error: tagError } = await supabase.from('tags').select('*').eq('slug', slug).single();
    if (tagError || !tag) {
        throw new Error(tagError?.message || "Tag not found");
    }

    const { data: gifs, error: gifsError } = await supabase
        .from('gif_tags')
        .select(`gifs(${BASE_GIF_QUERY})`)
        .eq('tag_id', tag.id)
        .then(response => ({
            ...response,
            data: response.data?.map(item => item.gifs) || []
        }));

    if (gifsError) {
        throw new Error(gifsError.message);
    }

    return { tag, gifs: gifs || [] };
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
    return data || [];
};