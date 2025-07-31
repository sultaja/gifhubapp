import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Gif, Category, Tag } from "@/types";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getTags } from "@/services/api";
import { useTranslation } from "react-i18next";
import { MultiSelectCombobox } from "@/components/ui/MultiSelectCombobox";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long."),
  url: z.string().url("Please enter a valid GIF URL."),
  slug: z.string().min(3, "Slug must be at least 3 characters long."),
  category_id: z.string().uuid("Please select a category."),
  tags: z.array(z.string().uuid()).min(1, "Please select at least one tag."),
  is_featured: z.boolean().default(false),
});

export type GifFormValues = z.infer<typeof formSchema>;

interface GifDialogProps {
  children: React.ReactNode;
  gif?: Gif;
  onSave: (values: GifFormValues, gifId?: string) => void;
  isSaving: boolean;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export function GifDialog({ children, gif, onSave, isSaving }: GifDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

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

  const form = useForm<GifFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
      slug: "",
      category_id: undefined,
      tags: [],
      is_featured: false,
    },
  });

  useEffect(() => {
    if (gif) {
      form.reset({
        title: gif.title,
        url: gif.url,
        slug: gif.slug,
        category_id: gif.category?.id,
        tags: gif.tags.map(t => t.id),
        is_featured: gif.is_featured || false,
      });
    } else {
      form.reset({
        title: "",
        url: "",
        slug: "",
        category_id: undefined,
        tags: [],
        is_featured: false,
      });
    }
  }, [gif, form]);

  const titleValue = form.watch("title");
  useEffect(() => {
    if (!form.getValues("slug") || !gif) {
      form.setValue("slug", generateSlug(titleValue));
    }
  }, [titleValue, form, gif]);

  const handleSubmit = (values: GifFormValues) => {
    onSave(values, gif?.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{gif ? t('admin.gif_dialog.edit_title') : t('admin.gif_dialog.add_title')}</DialogTitle>
          <DialogDescription>
            {gif
              ? t('admin.gif_dialog.edit_desc')
              : t('admin.gif_dialog.add_desc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.gif_dialog.title')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin.gif_dialog.title_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.gif_dialog.slug')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin.gif_dialog.slug_placeholder')} {...field} />
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
                  <FormLabel>{t('admin.gif_dialog.url')}</FormLabel>
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
                  <FormLabel>{t('admin.gif_dialog.category')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.gif_dialog.category_placeholder')} />
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
                  <FormLabel>{t('admin.gif_dialog.tags')}</FormLabel>
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
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>{t('admin.gif_dialog.featured')}</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t('admin.dialog_shared.cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? t('admin.dialog_shared.saving') : t('admin.gif_dialog.save_button')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}