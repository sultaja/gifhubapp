import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { Upload, Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold sm:inline-block">GifHub.App</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button asChild>
            <Link to="/submit">
              <Upload className="mr-2 h-4 w-4" /> Submit a GIF
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link to="/admin">
              <Shield className="h-4 w-4" />
            </Link>
          </Button>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;