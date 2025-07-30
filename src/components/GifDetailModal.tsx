import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gif } from "@/types";
import { Copy, Download, Link as LinkIcon } from "lucide-react";
import { showSuccess } from "@/utils/toast";

interface GifDetailModalProps {
  gif: Gif | null;
  isOpen: boolean;
  onClose: () => void;
}

const GifDetailModal = ({ gif, isOpen, onClose }: GifDetailModalProps) => {
  if (!gif) return null;

  const handleCopyLink = (link: string, type: string) => {
    navigator.clipboard.writeText(link);
    showSuccess(`${type} link copied to clipboard!`);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(gif.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `${gif.slug}.gif`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      showSuccess("GIF download started!");
    } catch (error) {
      console.error("Failed to download GIF:", error);
      showError("Failed to download GIF.");
    }
  };

  const markdownLink = `![${gif.title}](${gif.url})`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{gif.title}</DialogTitle>
          <DialogDescription>
            Category:{" "}
            <a href={`/category/${gif.category.slug}`} className="hover:underline">
              {gif.category.name}
            </a>
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <img
            src={gif.url}
            alt={gif.title}
            className="w-full h-auto rounded-md"
          />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {gif.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              <a href={`/tag/${tag.slug}`} className="hover:underline">
                #{tag.name}
              </a>
            </Badge>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button onClick={() => handleCopyLink(gif.url, "Direct")}>
            <LinkIcon className="mr-2 h-4 w-4" /> Copy Link
          </Button>
          <Button onClick={() => handleCopyLink(markdownLink, "Markdown")}>
            <Copy className="mr-2 h-4 w-4" /> Copy Markdown
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GifDetailModal;