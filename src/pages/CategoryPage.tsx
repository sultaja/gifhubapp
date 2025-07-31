import { useEffect } from "react";
import { useParams } from "react-router-dom";
import GifCard from "@/components/GifCard";
import NotFound from "./NotFound";
import { useQuery } from "@tanstack/react-query";
import { getGifsByCategorySlug } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { getTranslatedName } from "@/lib/translations";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => getGifsByCategorySlug(slug!),
    enabled: !!slug,
  });

  const category = data?.category;
  const filteredGifs = data?.gifs;
  const categoryName = getTranslatedName(category, i18n.language, 'category_translations');

  useEffect(() => {
    if (category) {
      document.title = `${t('category_page.title', { categoryName })} - GifHub.App`;
    } else if (isError) {
      document.title = `${t('category_page.meta_not_found')} - GifHub.App`;
    }
  }, [category, categoryName, isError, t]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <section className="py-12 text-center">
          <Skeleton className="h-10 w-1/2 mx-auto mb-2" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
        </section>
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="w-full h-auto aspect-square rounded-lg" />
          ))}
        </section>
      </div>
    );
  }

  if (isError || !category) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold mb-2">
          {t('category_page.heading', { categoryName })}
        </h1>
        <p className="text-muted-foreground">
          {t('category_page.description', { categoryName })}
        </p>
      </section>

      <section>
        {filteredGifs && filteredGifs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGifs.map((gif) => (
              <GifCard key={gif.id} gif={gif} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              {t('category_page.no_gifs')}
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;