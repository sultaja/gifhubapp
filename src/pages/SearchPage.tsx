import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { gifs } from "@/data/mock-data";
import { Gif } from "@/types";
import GifCard from "@/components/GifCard";
import GifDetailModal from "@/components/GifDetailModal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] = useState(query);
  const [filteredGifs, setFilteredGifs] = useState<Gif[]>([]);
  const [selectedGif, setSelectedGif] = useState<Gif | null>(null);

  useEffect(() => {
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      const results = gifs.filter(gif =>
        gif.title.toLowerCase().includes(lowerCaseQuery) ||
        gif.category.name.toLowerCase().includes(lowerCaseQuery) ||
        gif.tags.some(tag => tag.name.toLowerCase().includes(lowerCaseQuery))
      );
      setFilteredGifs(results);
      setSearchTerm(query);
      document.title = `Search results for "${query}" - GifHub.App`;
    } else {
      setFilteredGifs([]);
      document.title = "Search - GifHub.App";
    }
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleGifClick = (gif: Gif) => {
    setSelectedGif(gif);
  };

  const handleCloseModal = () => {
    setSelectedGif(null);
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
            <p className="text-muted-foreground">{filteredGifs.length} GIF(s) found</p>
          </div>
        )}

        {filteredGifs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGifs.map((gif) => (
              <GifCard key={gif.id} gif={gif} onClick={handleGifClick} />
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

      <GifDetailModal
        isOpen={!!selectedGif}
        gif={selectedGif}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default SearchPage;