import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GifFormValues } from "@/components/admin/GifDialog";
import { createSlug } from "@/utils/slug";

const saveGif = async (gif: GifFormValues & { id?: string; is_approved?: boolean }) => {
  const { tags, ...gifData } = gif;

  // 1. Upsert the GIF data
  const { data: savedGif, error: gifError } = await supabase
    .from("gifs")
    .upsert({
      ...gifData,
      slug: gifData.slug || createSlug(gifData.title),
    })
    .select()
    .single();

  if (gifError) throw gifError;

  // 2. Clear existing tags for this GIF
  const { error: deleteTagsError } = await supabase
    .from("gif_tags")
    .delete()
    .eq("gif_id", savedGif.id);

  if (deleteTagsError) throw deleteTagsError;

  // 3. Insert new tags
  if (tags && tags.length > 0) {
    const newGifTags = tags.map((tagId) => ({
      gif_id: savedGif.id,
      tag_id: tagId,
    }));

    const { error: insertTagsError } = await supabase
      .from("gif_tags")
      .insert(newGifTags);

    if (insertTagsError) throw insertTagsError;
  }

  return savedGif;
};

const deleteGif = async (gifId: string) => {
  // First, delete from the join table
  const { error: gifTagsError } = await supabase
    .from("gif_tags")
    .delete()
    .eq("gif_id", gifId);
  if (gifTagsError) throw gifTagsError;

  // Then, delete the GIF itself
  const { error: gifError } = await supabase
    .from("gifs")
    .delete()
    .eq("id", gifId);
  if (gifError) throw gifError;
};

export const useSaveGif = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveGif,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gifs"] });
      queryClient.invalidateQueries({ queryKey: ["pendingGifs"] });
      queryClient.invalidateQueries({ queryKey: ["featuredGifs"] });
    },
  });
};

export const useDeleteGif = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGif,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gifs"] });
      queryClient.invalidateQueries({ queryKey: ["pendingGifs"] });
    },
  });
};