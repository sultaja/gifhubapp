import { Card, CardContent } from "@/components/ui/card";
import { Gif } from "@/types";
import { Link } from "react-router-dom";

interface GifCardProps {
  gif: Gif;
}

const GifCard = ({ gif }: GifCardProps) => {
  return (
    <Link to={`/gif/${gif.slug}`} className="group block">
      <Card className="overflow-hidden cursor-pointer h-full border-2 border-transparent group-hover:border-primary transition-colors">
        <CardContent className="p-0 relative h-full">
          <img
            src={gif.url}
            alt={gif.title}
            className="w-full h-full object-cover aspect-square"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end p-2">
            <h3 className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {gif.title}
            </h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default GifCard;