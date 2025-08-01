import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useTranslation } from 'react-i18next';

const PageMetadata = () => {
  const { settings, isLoading } = useSiteSettings();
  const location = useLocation();
  const { i18n } = useTranslation();

  // Set page title based on settings
  useEffect(() => {
    if (!isLoading && settings?.page_titles) {
      const path = location.pathname;
      const titlesForLang = (settings.page_titles as any)?.[i18n.language] || (settings.page_titles as any)['en'] || {};
      const title = titlesForLang[path];
      if (title) {
        document.title = `${title} - GifHub.App`;
      }
    }
  }, [location.pathname, settings, isLoading, i18n.language]);

  // Inject header and footer scripts from site settings
  useEffect(() => {
    if (isLoading || !settings) {
      return;
    }

    const injectContent = (htmlContent: string, containerId: string, targetElement: HTMLElement) => {
      const markerAttr = `data-dyad-script-${containerId}`;

      // Clean up previous content from this source
      document.querySelectorAll(`[${markerAttr}]`).forEach(el => el.remove());

      if (!htmlContent || !htmlContent.trim()) {
        return;
      }

      // Use a DocumentFragment to parse and inject the HTML.
      // This is safer and more reliable than innerHTML for this use case.
      const fragment = document.createRange().createContextualFragment(htmlContent);
      
      // Mark all injected elements for future cleanup
      Array.from(fragment.children).forEach(child => {
        child.setAttribute(markerAttr, 'true');
      });

      targetElement.appendChild(fragment);
    };

    if (settings.header_scripts) {
      injectContent(settings.header_scripts, 'header', document.head);
    }

    if (settings.footer_scripts) {
      injectContent(settings.footer_scripts, 'footer', document.body);
    }

  }, [settings, isLoading]);

  return null; // This component does not render anything itself.
};

export default PageMetadata;