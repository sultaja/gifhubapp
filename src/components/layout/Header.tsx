import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ModeToggle";
import { Upload } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { settings } = useSiteSettings();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="GifHub.App Logo" className="h-6 w-auto" />
            ) : (
              <span className="font-bold sm:inline-block">GifHub.App</span>
            )}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button asChild>
            <Link to="/submit">
              <Upload className="mr-2 h-4 w-4" /> {t('header.submit_gif')}
            </Link>
          </Button>
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;