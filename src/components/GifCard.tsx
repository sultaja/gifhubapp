import { Card, CardContent } from "@/components/ui/card";
import { Gif } from "@/types";

interface GifCardProps {
  gif: Gif;
  onClick: (gif: Gif) => void;
}

const GifCard = ({ gif, onClick }: GifCardProps) => {
  return (
    <Card
      className="overflow-hidden cursor-pointer group"
      onClick={() => onClick(gif)}
    >
      <CardContent className="p-0 relative">
        <img
          src={gif.url}
          alt={gif.title}
          className="w-full h-auto object-cover aspect-square"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end p-2">
          <h3 className="text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {gif.title}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default GifCard;