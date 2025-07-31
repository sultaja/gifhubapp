import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import NotFound from "./NotFound";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Download, Link as LinkIcon } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getGifBySlug } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { getTranslatedTitle, getTranslatedName } from "@/lib/translations";

const GifPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();

  const { data: gif, isLoading, isError } = useQuery({
    queryKey: ["gif", slug],
    queryFn: () => getGifBySlug(slug!),
    enabled: !!slug,
  });

  const title = getTranslatedTitle(gif, i18n.language);
  const categoryName = getTranslatedName(gif?.category, i18n.language, 'category_translations');

  useEffect(() => {
    if (gif) {
      document.title = `${title} - GifHub.App`;
      const metaDescription = `Download or share the "${title}" GIF. Category: ${categoryName}. Tags: ${gif.tags.map(t => getTranslatedName(t, i18n.language, 'tag_translations')).join(', ')}.`;
      document.querySelector('meta[name="description"]')?.setAttribute("content", metaDescription);
    } else {
      document.title = "GIF Not Found - GifHub.App";
    }
  }, [gif, title, categoryName, i18n.language]);

  const handleCopyLink = (link: string, type: string) => {
    navigator.clipboard.writeText(link);
    showSuccess(`${type} ${t('gif_page.copy_success')}`);
  };

  const handleDownload = async () => {
    if (!gif) return;
    try {
      const response = await fetch(gif.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${gif.slug}.gif`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      showSuccess(t('gif_page.download_success'));
    } catch (error) {
      console.error("Failed to download GIF:", error);
      showError(t('gif_page.download_error'));
    }
  };

  if (isLoading) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Skeleton className="w-full aspect-video rounded-lg" />
                </div>
                <div>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-8 w-3/4 mb-2" />
                            <Skeleton className="h-5 w-1/2" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-6 w-1/4 mb-2" />
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-20" />
                                <Skeleton className="h-6 w-12" />
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
  }

  if (isError || !gif) {
    return <NotFound />;
  }

  const pageUrl = window.location.href;
  const markdownLink = `[![${title}](${gif.url})](${pageUrl})`;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <img
            src={gif.url}
            alt={title}
            className="w-full h-auto rounded-lg border"
          />
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              {gif.category && (
                <CardDescription>
                  {t('gif_page.in_category')}{" "}
                  <Link
                    to={`/category/${gif.category.slug}`}
                    className="hover:underline text-primary"
                  >
                    {categoryName}
                  </Link>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">{t('gif_page.tags')}</h4>
                <div className="flex flex-wrap gap-2">
                  {gif.tags.map((tag) => (
                     <Link key={tag.id} to={`/tag/${tag.slug}`}>
                      <Badge variant="secondary" className="hover:bg-accent">
                        #{getTranslatedName(tag, i18n.language, 'tag_translations')}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                 <Button onClick={() => handleCopyLink(pageUrl, "GIF")}>
                    <LinkIcon className="mr-2 h-4 w-4" /> {t('gif_page.copy_link')}
                  </Button>
                <Button onClick={() => handleCopyLink(markdownLink, "Markdown")}>
                  <Copy className="mr-2 h-4 w-4" /> {t('gif_page.copy_markdown')}
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" /> {t('gif_page.download')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GifPage;