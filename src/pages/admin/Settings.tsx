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

const formSchema = z.object({
  logo_url: z.string().url().or(z.literal("")).optional(),
  header_scripts: z.string().optional(),
  footer_scripts: z.string().optional(),
  page_titles: z.record(z.string()).optional(),
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
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["siteSettings"],
    queryFn: getSiteSettings,
  });

  const mutation = useMutation({
    mutationFn: (values: SettingsFormValues) => updateSiteSettings(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["siteSettings"] });
      showSuccess("Settings updated successfully!");
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
      form.reset({
        logo_url: settings.logo_url || "",
        header_scripts: settings.header_scripts || "",
        footer_scripts: settings.footer_scripts || "",
        page_titles: settings.page_titles || {},
      });
    }
  }, [settings, form]);

  const onSubmit = (values: SettingsFormValues) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">Site Settings</h1>
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Site Settings</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
              <CardDescription>Manage your site's logo.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-cdn.com/logo.svg" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormDescription>Enter the full URL of your logo image.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Page Titles (SEO)</CardTitle>
              <CardDescription>Set custom titles for your main pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {managedPages.map((page) => (
                <FormField
                  key={page.path}
                  control={form.control}
                  name={`page_titles.${page.path}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{page.label} ({page.path})</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Scripts</CardTitle>
              <CardDescription>Add custom HTML/scripts to your site's header or footer. Use with caution.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="header_scripts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header Scripts</FormLabel>
                    <FormControl>
                      <Textarea placeholder="<style>...</style> or <script>...</script>" {...field} value={field.value ?? ""} rows={5} />
                    </FormControl>
                    <FormDescription>Scripts will be added before the closing `&lt;/head&gt;` tag.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="footer_scripts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Footer Scripts</FormLabel>
                    <FormControl>
                      <Textarea placeholder="<script>...</script> for analytics, etc." {...field} value={field.value ?? ""} rows={5} />
                    </FormControl>
                    <FormDescription>Scripts will be added before the closing `&lt;/body&gt;` tag.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AdminSettingsPage;