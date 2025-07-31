import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContentSections, upsertContentSection } from "@/services/api";
import { ContentSection } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showSuccess, showError } from "@/utils/toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supportedLngs } from "@/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const manageableSections = [
  { key: 'about', name: 'About Page' },
  { key: 'contact', name: 'Contact Page' },
  { key: 'advertise', name: 'Advertise Page' },
  { key: 'privacy-policy', name: 'Privacy Policy Page' },
  { key: 'terms-of-service', name: 'Terms of Service Page' },
];

const formSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
});

type ContentFormValues = z.infer<typeof formSchema>;

interface ContentSectionFormProps {
  sectionKey: string;
  sectionName: string;
  initialData: Record<string, ContentSection>;
}

const ContentSectionForm = ({ sectionKey, sectionName, initialData }: ContentSectionFormProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (section: Partial<ContentSection>) => upsertContentSection(section),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contentSections"] });
      showSuccess(t('admin.content.toast_save_success', { sectionName }));
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const form = useForm<Record<string, ContentFormValues>>({
    resolver: zodResolver(z.record(formSchema)),
    defaultValues: Object.keys(supportedLngs).reduce((acc, lang) => {
      const data = initialData[lang];
      acc[lang] = {
        title: data?.title || '',
        content: data?.content || '',
        meta_title: data?.meta_title || '',
        meta_description: data?.meta_description || '',
      };
      return acc;
    }, {} as Record<string, ContentFormValues>),
  });

  const onSubmit = (values: Record<string, ContentFormValues>) => {
    for (const lang in values) {
      mutation.mutate({
        section_key: sectionKey,
        language_code: lang,
        ...values[lang],
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{sectionName}</CardTitle>
        <CardDescription>Manage the content for this page in all supported languages.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue={Object.keys(supportedLngs)[0]} className="w-full">
              <TabsList>
                {Object.entries(supportedLngs).map(([code, name]) => (
                  <TabsTrigger key={code} value={code}>{name}</TabsTrigger>
                ))}
              </TabsList>
              {Object.keys(supportedLngs).map(code => (
                <TabsContent key={code} value={code}>
                  <div className="space-y-4 p-1">
                    <FormField
                      control={form.control}
                      name={`${code}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.content.form_title')}</FormLabel>
                          <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`${code}.content`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.content.form_content')}</FormLabel>
                          <FormControl><Textarea {...field} value={field.value ?? ""} rows={10} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`${code}.meta_title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.content.form_meta_title')}</FormLabel>
                          <FormControl><Input {...field} value={field.value ?? ""} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`${code}.meta_description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('admin.content.form_meta_desc')}</FormLabel>
                          <FormControl><Textarea {...field} value={field.value ?? ""} rows={3} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? t('admin.dialog_shared.saving') : t('admin.content.save_button', { sectionName })}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};


const AdminContentPage = () => {
  const { t } = useTranslation();
  const { data: contentSections, isLoading } = useQuery({
    queryKey: ["contentSections"],
    queryFn: getContentSections,
  });

  const groupedData = useMemo(() => {
    if (!contentSections) return {};
    return contentSections.reduce((acc, section) => {
      if (!acc[section.section_key]) {
        acc[section.section_key] = {};
      }
      acc[section.section_key][section.language_code] = section;
      return acc;
    }, {} as Record<string, Record<string, ContentSection>>);
  }, [contentSections]);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">{t('admin.content.title')}</h1>
        <div className="space-y-8">
          {manageableSections.map(section => <Skeleton key={section.key} className="w-full h-96" />)}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('admin.content.title')}</h1>
      <div className="space-y-8">
        {manageableSections.map(section => (
          <ContentSectionForm
            key={section.key}
            sectionKey={section.key}
            sectionName={section.name}
            initialData={groupedData[section.key] || {}}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminContentPage;