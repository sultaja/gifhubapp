import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import GifCard from "@/components/GifCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchGifs } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(query);

  const { data: filteredGifs, isLoading } = useQuery({
    queryKey: ["searchGifs", query],
    queryFn: () => searchGifs(query),
    enabled: !!query,
  });

  useEffect(() => {
    setSearchTerm(query);
    if (query) {
      document.title = `Search results for "${query}" - GifHub.App`;
    } else {
      document.title = "Search - GifHub.App";
    }
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-center">Search GIFs</h1>
        <div className="max-w-xl mx-auto mb-8">
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

        {query && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">
              Results for "{query}"
            </h2>
            <p className="text-muted-foreground">{filteredGifs?.length || 0} GIF(s) found</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-auto aspect-square rounded-lg" />
            ))}
          </div>
        ) : filteredGifs && filteredGifs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGifs.map((gif) => (
              <GifCard key={gif.id} gif={gif} />
            ))}
          </div>
        ) : (
          query && (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground">
                No GIFs found for your search. Try another term!
              </p>
            </div>
          )
        )}
      </section>
    </div>
  );
};

export default SearchPage;