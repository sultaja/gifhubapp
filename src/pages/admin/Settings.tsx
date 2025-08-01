import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSiteSettings, updateSiteSettings } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showSuccess, showError } from "@/utils/toast";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supportedLngs } from "@/i18n";

const formSchema = z.object({
  logo_url: z.string().url().or(z.literal("")).optional(),
  header_scripts: z.string().optional(),
  footer_scripts: z.string().optional(),
  page_titles: z.record(z.record(z.string())).optional(),
});

type SettingsFormValues = z.infer<typeof formSchema>;

const managedPages = [
  { path: "/", label: "Homepage" },
  { path: "/submit", label: "Submit GIF Page" },
  { path: "/about", label: "About Page" },
  { path: "/contact", label: "Contact Page" },
  { path: "/advertise", label: "Advertise Page" },
  { path: "/privacy-policy", label: "Privacy Policy Page" },
  { path: "/terms-of-service", label: "Terms of Service Page" },
];

const AdminSettingsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: getSiteSettings,
  });

  const mutation = useMutation({
    mutationFn: (values: SettingsFormValues) => updateSiteSettings(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      showSuccess(t('admin.settings.toast_save_success'));
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (settings) {
      const initialPageTitles: Record<string, Record<string, string>> = {};
      for (const lang of Object.keys(supportedLngs)) {
        initialPageTitles[lang] = (settings.page_titles as any)?.[lang] || {};
      }
      form.reset({
        logo_url: settings.logo_url || "",
        header_scripts: settings.header_scripts || "",
        footer_scripts: settings.footer_scripts || "",
        page_titles: initialPageTitles,
      });
    }
  }, [settings, form]);

  const onSubmit = (values: SettingsFormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">{t('admin.settings.title')}</h1>
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('admin.settings.title')}</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>{t('admin.settings.verification_title')}</CardTitle>
              <CardDescription>
                {t('admin.settings.verification_desc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-2">{t('admin.settings.verification_file')}</p>
              <div className="bg-muted rounded-md p-4 text-sm text-muted-foreground overflow-x-auto">
                <pre>
                  <code>
{`<!doctype html>
<html lang="en">
  <head>
    ...
    <meta property="twitter:image" content="/placeholder.svg">

    <!-- PASTE YOUR VERIFICATION TAGS (e.g., Google Search Console) HERE -->

    <meta name="theme-color" content="#ffffff">
  </head>
  ...
</html>`}
                  </code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.settings.branding_title')}</CardTitle>
              <CardDescription>{t('admin.settings.branding_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.settings.logo_url')}</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-cdn.com/logo.svg" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>{t('admin.settings.logo_url_desc')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.settings.seo_title')}</CardTitle>
              <CardDescription>{t('admin.settings.seo_desc')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(supportedLngs)[0]} className="w-full">
                <TabsList>
                  {Object.entries(supportedLngs).map(([code, name]) => (
                    <TabsTrigger key={code} value={code}>{name}</TabsTrigger>
                  ))}
                </TabsList>
                {Object.keys(supportedLngs).map(code => (
                  <TabsContent key={code} value={code}>
                    <div className="space-y-4 p-1 mt-4">
                      {managedPages.map((page) => (
                        <FormField
                          key={`${code}-${page.path}`}
                          control={form.control}
                          name={`page_titles.${code}.${page.path}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{page.label} ({page.path})</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value ?? ''} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('admin.settings.scripts_title')}</CardTitle>
              <CardDescription>{t('admin.settings.scripts_desc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="header_scripts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.settings.header_scripts')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder="<style>...</style> or <script>...</script>" {...field} value={field.value ?? ""} rows={5} />
                    </FormControl>
                    <FormDescription>{t('admin.settings.header_scripts_desc')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="footer_scripts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('admin.settings.footer_scripts')}</FormLabel>
                    <FormControl>
                      <Textarea placeholder="<script>...</script> for analytics, etc." {...field} value={field.value ?? ""} rows={5} />
                    </FormControl>
                    <FormDescription>{t('admin.settings.footer_scripts_desc')}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? t('admin.dialog_shared.saving') : t('admin.settings.save_button')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AdminSettingsPage;