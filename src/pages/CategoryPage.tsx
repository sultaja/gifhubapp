import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { categories, gifs } from "@/data/mock-data";
import GifCard from "@/components/GifCard";
import NotFound from "./NotFound";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const category = categories.find((c) => c.slug === slug);
  const filteredGifs = gifs.filter((gif) => gif.category.slug === slug);

  useEffect(() => {
    if (category) {
      document.title = `${category.name} GIFs - GifHub.App`;
      const metaDescriptionTag = document.querySelector('meta[name="description"]');
      const description = `Browse our collection of high-quality GIFs in the "${category.name}" category. Perfect for product launches, team meetings, and more.`;
      
      if (metaDescriptionTag) {
        metaDescriptionTag.setAttribute("content", description);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.name = "description";
        newMeta.content = description;
        document.head.appendChild(newMeta);
      }
    } else {
      document.title = "Category Not Found - GifHub.App";
    }
  }, [category]);

  if (!category) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold mb-2">
          Category: {category.name}
        </h1>
        <p className="text-muted-foreground">
          Browsing all GIFs in the "{category.name}" category.
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
              No GIFs found in this category yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CategoryPage;