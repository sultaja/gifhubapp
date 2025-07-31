import { Link } from "react-router-dom";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const Footer = () => {
  const { settings } = useSiteSettings();

  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="flex flex-col-reverse items-center justify-between gap-8 md:flex-row">
          <div className="text-center text-sm text-muted-foreground md:text-left">
            <Link to="/" className="mb-2 flex items-center justify-center space-x-2 md:justify-start">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="GifHub.App Logo" className="h-6 w-auto" />
              ) : (
                <span className="font-bold sm:inline-block">GifHub.App</span>
              )}
            </Link>
            <p>&copy; {new Date().getFullYear()} GifHub.App. All Rights Reserved.</p>
            <p>
              Built by{" "}
              <a
                href="https://www.dyad.sh"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                Dyad
              </a>
              . Source on{" "}
              <a
                href="#"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4 hover:text-primary"
              >
                GitHub
              </a>
              .
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div className="flex flex-col space-y-2">
              <h4 className="font-semibold">Company</h4>
              <Link to="/about" className="text-muted-foreground hover:text-primary hover:underline">About</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary hover:underline">Contact</Link>
              <Link to="/advertise" className="text-muted-foreground hover:text-primary hover:underline">Advertise</Link>
            </div>
            <div className="flex flex-col space-y-2">
              <h4 className="font-semibold">Legal</h4>
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary hover:underline">Privacy</Link>
              <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary hover:underline">Terms</Link>
            </div>
             <div className="flex flex-col space-y-2">
              <h4 className="font-semibold">Community</h4>
              <Link to="/submit" className="text-muted-foreground hover:text-primary hover:underline">Submit a GIF</Link>
              <a href="#" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary hover:underline">GitHub</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;