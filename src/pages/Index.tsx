import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GifCard from "@/components/GifCard";
import { useQuery } from "@tanstack/react-query";
import { getHierarchicalCategories, getLatestGifs, getFeaturedGifs } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import DynamicIcon from "@/components/DynamicIcon";
import { useTranslation } from "react-i18next";
import { getTranslatedName } from "@/lib/translations";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["hierarchicalCategories"],
    queryFn: getHierarchicalCategories,
  });

  const { data: latestGifs, isLoading: isLoadingLatestGifs } = useQuery({
    queryKey: ["latestGifs"],
    queryFn: () => getLatestGifs(12),
  });

  const { data: featuredGifs, isLoading: isLoadingFeaturedGifs } = useQuery({
    queryKey: ["featuredGifs"],
    queryFn: () => getFeaturedGifs(8),
  });

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
          {t('home.hero.title')}
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t('home.hero.subtitle')}
        </p>
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="flex w-full items-center space-x-2">
            <Input
              type="search"
              placeholder={t('home.hero.search_placeholder')}
              className="flex-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>

      {/* Featured GIFs */}
      {featuredGifs && featuredGifs.length > 0 && (
        <section className="py-12">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('home.featured_gifs')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoadingFeaturedGifs ? (
              Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="w-full h-auto aspect-square rounded-lg" />)
            ) : (
              featuredGifs?.map((gif) => (
                <GifCard key={gif.id} gif={gif} />
              ))
            )}
          </div>
        </section>
      )}

      {/* Trending Categories */}
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-8 text-center">{t('home.browse_by_category')}</h2>
        {isLoadingCategories ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-6 gap-y-8">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-x-6 gap-y-8">
            {categories?.map((category) => (
              <div key={category.id}>
                <Link to={`/category/${category.slug}`} className="flex items-center gap-2 mb-3 group">
                  <DynamicIcon name={category.icon || 'Folder'} className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
                  <h3 className="font-bold text-md group-hover:text-primary transition-colors">
                    {getTranslatedName(category, i18n.language, 'category_translations')}
                  </h3>
                </Link>
                <div className="flex flex-col items-start space-y-2 pl-7">
                  {category.sub_categories.length > 0 ? (
                    category.sub_categories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/category/${sub.slug}`}
                        className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4"
                      >
                        {getTranslatedName(sub, i18n.language, 'category_translations')}
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">{t('home.no_subcategories')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Latest GIFs */}
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">{t('home.latest_gifs')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoadingLatestGifs ? (
            Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="w-full h-auto aspect-square rounded-lg" />)
          ) : (
            latestGifs?.map((gif) => (
              <GifCard key={gif.id} gif={gif} />
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Index;