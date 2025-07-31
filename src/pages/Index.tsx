import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import GifCard from "@/components/GifCard";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getLatestGifs, getFeaturedGifs } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryCard from "@/components/CategoryCard";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
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
        <h2 className="text-2xl font-bold mb-6 text-center">Trending Categories</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {isLoadingCategories ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)
          ) : (
            categories?.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          )}
        </div>
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