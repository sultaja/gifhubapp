import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { getCategories, submitNewGif } from "@/services/api";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Category } from "@/types";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  url: z.string().url("Please enter a valid GIF URL."),
  category_id: z.string().uuid("Please select a category."),
  tags: z.string().min(1, "Please enter at least one tag."),
});

const SubmitGifPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      tags: "",
      category_id: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const toastId = showLoading(t('submit_page.toast.submitting'));

    try {
      await submitNewGif(values);
      dismissToast(toastId);
      showSuccess(t('submit_page.toast.pending_success'));
      navigate(`/`);
    } catch (error: any) {
      dismissToast(toastId);
      showError(error?.message || t('submit_page.toast.submit_error'));
      setIsSubmitting(false);
    }
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
                  <Input placeholder={t('submit_page.form.tags_placeholder')} {...field} />
                </FormControl>
                <FormDescription>
                  {t('submit_page.form.tags_desc')}
                </FormDescription>
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