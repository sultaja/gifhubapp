import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories, getTags } from "@/services/api";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Category, Tag } from "@/types";
import { useTranslation } from "react-i18next";
import { MultiSelectCombobox } from "@/components/ui/MultiSelectCombobox";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  url: z.string().url("Please enter a valid GIF URL."),
  category_id: z.string().uuid("Please select a category."),
  tags: z.array(z.string().uuid()).min(1, "Please select at least one tag."),
});

const SubmitGifPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: tags, isLoading: isLoadingTags } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  const tagOptions = useMemo(() => {
    return tags?.map(tag => ({ value: tag.id, label: tag.name })) || [];
  }, [tags]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      tags: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const toastId = showLoading(t('submit_page.toast.submitting'));

    const slug = values.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data: gifData, error: gifError } = await supabase
      .from("gifs")
      .insert({
        title: values.title,
        url: values.url,
        slug: `${slug}-${Date.now()}`, // Ensure unique slug
        category_id: values.category_id,
      })
      .select()
      .single();

    if (gifError || !gifData) {
      dismissToast(toastId);
      showError(gifError?.message || t('submit_page.toast.submit_error'));
      setIsSubmitting(false);
      return;
    }

    const gifTags = values.tags.map(tagId => ({
        gif_id: gifData.id,
        tag_id: tagId
    }));

    const { error: tagsError } = await supabase.from("gif_tags").insert(gifTags);

    if (tagsError) {
        // Attempt to clean up the created GIF if tag association fails
        await supabase.from("gifs").delete().eq("id", gifData.id);
        dismissToast(toastId);
        showError(tagsError.message || t('submit_page.toast.tags_error'));
        setIsSubmitting(false);
        return;
    }

    dismissToast(toastId);
    showSuccess(t('submit_page.toast.success'));
    queryClient.invalidateQueries({ queryKey: ['featuredGifs'] });
    navigate(`/gif/${gifData.slug}`);
  };

  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-4xl font-bold mb-4">{t('submit_page.title')}</h1>
      <p className="text-muted-foreground mb-8">
        {t('submit_page.subtitle')}
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('submit_page.form.title')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('submit_page.form.title_placeholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('submit_page.form.url')}</FormLabel>
                <FormControl>
                  <Input placeholder="https://media.giphy.com/..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('submit_page.form.category')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('submit_page.form.category_placeholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <SelectItem value="loading" disabled>{t('submit_page.form.loading')}</SelectItem>
                    ) : (
                      categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('submit_page.form.tags')}</FormLabel>
                <FormControl>
                  <MultiSelectCombobox
                    options={tagOptions}
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder={isLoadingTags ? t('submit_page.form.loading') : "Select tags..."}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('submit_page.submitting') : t('submit_page.submit_button')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default SubmitGifPage;