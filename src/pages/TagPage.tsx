import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { tags, gifs } from "@/data/mock-data";
import { Gif } from "@/types";
import GifCard from "@/components/GifCard";
import GifDetailModal from "@/components/GifDetailModal";
import NotFound from "./NotFound";

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedGif, setSelectedGif] = useState<Gif | null>(null);

  const tag = tags.find((t) => t.slug === slug);
  const filteredGifs = gifs.filter((gif) =>
    gif.tags.some((t) => t.slug === slug)
  );

  useEffect(() => {
    if (tag) {
      document.title = `GIFs tagged #${tag.name} - GifHub.App`;
    } else {
      document.title = "Tag Not Found - GifHub.App";
    }
  }, [tag]);

  if (!tag) {
    return <NotFound />;
  }

  const handleGifClick = (gif: Gif) => {
    setSelectedGif(gif);
  };

  const handleCloseModal = () => {
    setSelectedGif(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Tag: #{tag.name}</h1>
        <p className="text-muted-foreground">
          Browsing all GIFs tagged with "{tag.name}".
        </p>
      </section>

      <section>
        {filteredGifs.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredGifs.map((gif) => (
              <GifCard key={gif.id} gif={gif} onClick={handleGifClick} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-lg text-muted-foreground">
              No GIFs found with this tag yet.
            </p>
          </div>
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

export default TagPage;