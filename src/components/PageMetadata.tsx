import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const PageMetadata = () => {
  const { settings, isLoading } = useSiteSettings();
  const location = useLocation();

  // Set page title
  useEffect(() => {
    if (!isLoading && settings?.page_titles) {
      const path = location.pathname;
      const title = settings.page_titles[path];
      if (title) {
        document.title = `${title} - GifHub.App`;
      }
    }
  }, [location.pathname, settings, isLoading]);

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