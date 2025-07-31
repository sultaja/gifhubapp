import { Link } from "react-router-dom";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { settings } = useSiteSettings();
  const { t } = useTranslation();

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
                {t('footer.github')}
              </a>
              .
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div className="flex flex-col space-y-2">
              <h4 className="font-semibold">{t('footer.company')}</h4>
              <Link to="/about" className="text-muted-foreground hover:text-primary hover:underline">{t('footer.about')}</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary hover:underline">{t('footer.contact')}</Link>
              <Link to="/advertise" className="text-muted-foreground hover:text-primary hover:underline">{t('footer.advertise')}</Link>
            </div>
            <div className="flex flex-col space-y-2">
              <h4 className="font-semibold">{t('footer.legal')}</h4>
              <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary hover:underline">{t('footer.privacy')}</Link>
              <Link to="/terms-of-service" className="text-muted-foreground hover:text-primary hover:underline">{t('footer.terms')}</Link>
            </div>
             <div className="flex flex-col space-y-2">
              <h4 className="font-semibold">{t('footer.community')}</h4>
              <Link to="/submit" className="text-muted-foreground hover:text-primary hover:underline">{t('header.submit_gif')}</Link>
              <a href="#" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary hover:underline">{t('footer.github')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;