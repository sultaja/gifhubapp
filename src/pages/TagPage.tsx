import { useEffect } from "react";
import { useParams } from "react-router-dom";
import GifCard from "@/components/GifCard";
import NotFound from "./NotFound";
import { useQuery } from "@tanstack/react-query";
import { getGifsByTagSlug } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { getTranslatedName } from "@/lib/translations";

const TagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["tag", slug],
    queryFn: () => getGifsByTagSlug(slug!),
    enabled: !!slug,
  });

  const tag = data?.tag;
  const filteredGifs = data?.gifs;
  const tagName = getTranslatedName(tag, i18n.language, 'tag_translations');

  useEffect(() => {
    if (tag) {
      document.title = `GIFs tagged #${tagName} - GifHub.App`;
    } else if (isError) {
      document.title = "Tag Not Found - GifHub.App";
    }
  }, [tag, tagName, isError]);

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

  if (isError || !tag) {
    return <NotFound />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold mb-2">Tag: #{tagName}</h1>
        <p className="text-muted-foreground">
          Browsing all GIFs tagged with "{tagName}".
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
              No GIFs found with this tag yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default TagPage;