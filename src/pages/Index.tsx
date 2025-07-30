import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { categories, gifs } from "@/data/mock-data";
import GifCard from "@/components/GifCard";
import GifDetailModal from "@/components/GifDetailModal";
import { Gif } from "@/types";

const Index = () => {
  const [selectedGif, setSelectedGif] = useState<Gif | null>(null);

  const handleGifClick = (gif: Gif) => {
    setSelectedGif(gif);
  };

  const handleCloseModal = () => {
    setSelectedGif(null);
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
          <form className="flex w-full items-center space-x-2">
            <Input
              type="search"
              placeholder="Search by title, tag, or category..."
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>

      {/* Trending Categories */}
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Trending Categories</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <Button key={category.id} variant="outline" asChild>
              <Link to={`/category/${category.slug}`}>{category.name}</Link>
            </Button>
          ))}
        </div>
      </section>

      {/* Featured GIFs */}
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Featured GIFs</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gifs.map((gif) => (
            <GifCard key={gif.id} gif={gif} onClick={handleGifClick} />
          ))}
        </div>
      </section>

      <GifDetailModal
        isOpen={!!selectedGif}
        gif={selectedGif}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Index;