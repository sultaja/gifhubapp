import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useTranslation } from 'react-i18next';

const PageMetadata = () => {
  const { settings, isLoading } = useSiteSettings();
  const location = useLocation();
  const { i18n } = useTranslation();

  // Set page title
  useEffect(() => {
    if (!isLoading && settings?.page_titles) {
      const path = location.pathname;
      const titlesForLang = (settings.page_titles as any)[i18n.language] || (settings.page_titles as any)['en'] || {};
      const title = titlesForLang[path];
      if (title) {
        document.title = `${title} - GifHub.App`;
      }
    }
  }, [location.pathname, settings, isLoading, i18n.language]);

  // Inject header and footer scripts
  useEffect(() => {
    if (!isLoading && settings) {
      const head = document.head;
      const body = document.body;
      const headerScriptsContainerId = 'header-scripts-container';
      const footerScriptsContainerId = 'footer-scripts-container';

      // Clear previous scripts
      document.getElementById(headerScriptsContainerId)?.remove();
      document.getElementById(footerScriptsContainerId)?.remove();

      // Inject header scripts
      if (settings.header_scripts) {
        const headerContainer = document.createElement('div');
        headerContainer.id = headerScriptsContainerId;
        headerContainer.innerHTML = settings.header_scripts;
        head.appendChild(headerContainer);
      }

      // Inject footer scripts
      if (settings.footer_scripts) {
        const footerContainer = document.createElement('div');
        footerContainer.id = footerScriptsContainerId;
        footerContainer.innerHTML = settings.footer_scripts;
        body.appendChild(footerContainer);
      }
    }
  }, [settings, isLoading]);

  return null;
};

export default PageMetadata;