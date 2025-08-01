import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { showError } from '@/utils/toast';
import { Search } from 'lucide-react';

interface GiphySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (url: string) => void;
}

interface GiphyGif {
  id: string;
  images: {
    original: {
      url: string;
    };
  };
  title: string;
}

export const GiphySelector = ({ open, onOpenChange, onSelect }: GiphySelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<GiphyGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    setResults([]);
    try {
      const { data, error } = await supabase.functions.invoke('giphy-search', {
        body: { query: searchTerm },
      });

      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data);
    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Failed to search Giphy. Make sure the GIPHY_API_KEY is set correctly in your Supabase project secrets.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGif = (gif: GiphyGif) => {
    onSelect(gif.images.original.url);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Search Giphy</DialogTitle>
          <DialogDescription>Search for a GIF on Giphy and select it to populate the URL field.</DialogDescription>
        </DialogHeader>
        <div className="flex w-full items-center space-x-2 py-4">
          <Input
            placeholder="Search for a GIF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto rounded-md border p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-auto aspect-square rounded-lg" />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((gif) => (
                <div key={gif.id} className="cursor-pointer group" onClick={() => handleSelectGif(gif)}>
                  <img
                    src={gif.images.original.url}
                    alt={gif.title}
                    className="w-full h-full object-cover aspect-square rounded-lg border-2 border-transparent group-hover:border-primary transition-colors"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <p>Search for GIFs to see results here.</p>
            </div>
          )}
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};