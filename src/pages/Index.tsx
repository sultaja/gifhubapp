import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import GifCard from "@/components/GifCard";
import { useQuery } from "@tanstack/react-query";
import { getHierarchicalCategories, getLatestGifs, getFeaturedGifs } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import DynamicIcon from "@/components/DynamicIcon";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { getTranslatedName } from "@/lib/translations";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { i18n } = useTranslation();

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
          The perfect GIF for your next big move.
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A sleek, ultra-fast, and highly-curated platform for discovering and sharing GIFs for the professional world.
        </p>
        <div className="max-w-xl mx-auto">
          <form onSubmit={handleSearchSubmit} className="flex w-full items-center space-x-2">
            <Input
              type="search"
              placeholder="Search by title, tag, or category..."
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
          <h2 className="text-2xl font-bold mb-6 text-center">Featured GIFs</h2>
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
        <h2 className="text-2xl font-bold mb-6 text-center">Browse by Category</h2>
        {isLoadingCategories ? (
          <div className="max-w-4xl mx-auto space-y-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : (
          <Accordion type="multiple" className="w-full max-w-4xl mx-auto">
            {categories?.map((category) => (
              <AccordionItem value={category.id} key={category.id}>
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  <div className="flex items-center gap-3">
                    <DynamicIcon name={category.icon || 'Folder'} className="h-6 w-6 text-primary" />
                    {getTranslatedName(category, i18n.language, 'category_translations')}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-4 flex flex-wrap gap-2">
                    {category.sub_categories.length > 0 ? (
                      category.sub_categories.map((sub) => (
                        <Link key={sub.id} to={`/category/${sub.slug}`}>
                          <Badge variant="outline" className="text-md py-1 px-3 hover:bg-accent">
                            {getTranslatedName(sub, i18n.language, 'category_translations')}
                          </Badge>
                        </Link>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No sub-categories yet.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </section>

      {/* Latest GIFs */}
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Latest GIFs</h2>
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