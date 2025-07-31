import { supabase } from "./supabase/client";
import { Gif, Category, Tag, GifWithRelations } from "@/types";

const mapGifData = (gif: any): GifWithRelations => ({
  ...gif,
  category: gif.categories,
  tags: gif.gif_tags?.map((gt: any) => gt.tags) || [],
});

export const getGifs = async () => {
  const { data, error } = await supabase
    .from("gifs")
    .select(`
      *,
      categories(*),
      gif_tags(tags(*))
    `)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(mapGifData);
};

export const getPendingGifs = async () => {
  const { data, error } = await supabase
    .from("gifs")
    .select(`
      *,
      categories(*),
      gif_tags(tags(*))
    `)
    .eq("is_approved", false)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data.map(mapGifData);
};

export const getFeaturedGifs = async () => {
  const { data, error } = await supabase
    .from("gifs")
    .select(`
      *,
      categories(*),
      gif_tags(tags(*))
    `)
    .eq("is_featured", true)
    .eq("is_approved", true)
    .limit(12);

  if (error) throw new Error(error.message);
  return data.map(mapGifData);
};

export const getGifBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from("gifs")
    .select(`
      *,
      categories(*),
      gif_tags(tags(*))
    `)
    .eq("slug", slug)
    .eq("is_approved", true)
    .single();

  if (error) throw new Error(error.message);
  return mapGifData(data);
};

export const getGifsByCategory = async (categoryId: string) => {
    const { data, error } = await supabase
        .from('gifs')
        .select(`
            *,
            categories(*),
            gif_tags(tags(*))
        `)
        .eq('category_id', categoryId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data.map(mapGifData);
};

export const getGifsByTag = async (tagId: string) => {
    const { data, error } = await supabase
        .from('gif_tags')
        .select(`
            gifs (
                *,
                categories(*),
                gif_tags(tags(*))
            )
        `)
        .eq('tag_id', tagId)
        .eq('gifs.is_approved', true);

    if (error) throw new Error(error.message);
    return data.map(item => mapGifData(item.gifs));
};


export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw new Error(error.message);
  return data;
};

export const getCategoryById = async (id: string): Promise<Category> => {
    const { data, error } = await supabase.from('categories').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data;
};

export const getTags = async (): Promise<Tag[]> => {
  const { data, error } = await supabase.from("tags").select("*").order("name");
  if (error) throw new Error(error.message);
  return data;
};

export const getTagById = async (id: string): Promise<Tag> => {
    const { data, error } = await supabase.from('tags').select('*').eq('id', id).single();
    if (error) throw new Error(error.message);
    return data;
};