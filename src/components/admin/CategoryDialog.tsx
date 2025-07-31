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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Category } from "@/types";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/api";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Category name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }),
  icon: z.string().optional(),
  parent_id: z.string().nullable().optional(),
});

export type CategoryFormValues = z.infer<typeof formSchema>;

interface CategoryDialogProps {
  children: React.ReactNode;
  category?: Category;
  onSave: (values: z.infer<typeof formSchema>, categoryId?: string) => void;
  isSaving: boolean;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export function CategoryDialog({ children, category, onSave, isSaving }: CategoryDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data: allCategories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: getCategories,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      icon: "",
      parent_id: null,
    },
  });

  const { formState: { dirtyFields } } = form;

  useEffect(() => {
    if (category) {
      form.reset({ name: category.name, slug: category.slug, icon: category.icon || "", parent_id: category.parent_id });
    } else {
      form.reset({ name: "", slug: "", icon: "", parent_id: null });
    }
  }, [category, form, open]);

  const nameValue = form.watch("name");
  useEffect(() => {
    if (!dirtyFields.slug) {
      form.setValue("slug", generateSlug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, dirtyFields.slug, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values, category?.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? t('admin.category_dialog.edit_title') : t('admin.category_dialog.add_title')}</DialogTitle>
          <DialogDescription>
            {category
              ? t('admin.category_dialog.edit_desc')
              : t('admin.category_dialog.add_desc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.category_dialog.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin.category_dialog.name_placeholder')} {...field} />
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
                  <FormLabel>{t('admin.category_dialog.slug')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin.category_dialog.slug_placeholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.category_dialog.parent')}</FormLabel>
                  <Select onValueChange={(value) => field.onChange(value === "none" ? null : value)} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.category_dialog.parent_placeholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">{t('admin.category_dialog.parent_none')}</SelectItem>
                      {isLoadingCategories ? (
                        <SelectItem value="loading" disabled>{t('submit_page.form.loading')}</SelectItem>
                      ) : (
                        allCategories?.filter(c => c.id !== category?.id).map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {t('admin.category_dialog.parent_desc')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.category_dialog.icon')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin.category_dialog.icon_placeholder')} {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>
                    {t('admin.category_dialog.icon_desc')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  {t('admin.dialog_shared.cancel')}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? t('admin.dialog_shared.saving') : t('admin.category_dialog.save_button')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}