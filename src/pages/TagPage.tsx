import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { tags, gifs } from "@/data/mock-data";
import GifCard from "@/components/GifCard";
import NotFound from "./NotFound";

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const tag = tags.find((t) => t.slug === slug);
  const filteredGifs = gifs.filter((gif) =>
    gif.tags.some((t) => t.slug === slug)
  );

  useEffect(() => {
    if (tag) {
      document.title = `GIFs tagged #${tag.name} - GifHub.App`;
      const metaDescriptionTag = document.querySelector('meta[name="description"]');
      const description = `Find the best GIFs tagged with #${tag.name}. Explore funny, celebratory, and reaction GIFs for every occasion.`;

      if (metaDescriptionTag) {
        metaDescriptionTag.setAttribute("content", description);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = "description";
        newMeta.content = description;
        document.head.appendChild(newMeta);
      }
    } else {
      document.title = "Tag Not Found - GifHub.App";
    }
  }, [tag]);

  if (!tag) {
    return <NotFound />;
  }

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
              <GifCard key={gif.id} gif={gif} />
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
    </div>
  );
};

export default TagPage;