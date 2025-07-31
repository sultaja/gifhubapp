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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Tag } from "@/types";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Tag name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }),
});

export type TagFormValues = z.infer<typeof formSchema>;

interface TagDialogProps {
  children: React.ReactNode;
  tag?: Tag;
  onSave: (values: z.infer<typeof formSchema>, tagId?: string) => void;
  isSaving: boolean;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export function TagDialog({ children, tag, onSave, isSaving }: TagDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const { formState: { dirtyFields } } = form;

  useEffect(() => {
    if (tag) {
      form.reset({ name: tag.name, slug: tag.slug });
    } else {
      form.reset({ name: "", slug: "" });
    }
  }, [tag, form, open]);

  const nameValue = form.watch("name");
  useEffect(() => {
    if (!dirtyFields.slug) {
      form.setValue("slug", generateSlug(nameValue), { shouldValidate: true });
    }
  }, [nameValue, dirtyFields.slug, form]);

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values, tag?.id);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{tag ? t('admin.tag_dialog.edit_title') : t('admin.tag_dialog.add_title')}</DialogTitle>
          <DialogDescription>
            {tag
              ? t('admin.tag_dialog.edit_desc')
              : t('admin.tag_dialog.add_desc')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('admin.tag_dialog.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin.tag_dialog.name_placeholder')} {...field} />
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
                  <FormLabel>{t('admin.tag_dialog.slug')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('admin.tag_dialog.slug_placeholder')} {...field} />
                  </FormControl>
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
                {isSaving ? t('admin.dialog_shared.saving') : t('admin.tag_dialog.save_button')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}