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

    const injectScripts = (scriptHTML: string, containerId: string, targetElement: HTMLElement) => {
      const markerAttr = `data-dyad-script-${containerId}`;

      // Clean up previous scripts from this source to prevent duplicates on re-render
      document.querySelectorAll(`[${markerAttr}]`).forEach(el => el.remove());

      const container = document.createElement('div');
      container.innerHTML = scriptHTML;

      // Re-create script elements to ensure they are executed by the browser
      container.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });

      // Append all nodes from the container to the target element (head or body)
      // and add a marker attribute for cleanup on the next run.
      Array.from(container.children).forEach(child => {
        child.setAttribute(markerAttr, 'true');
        targetElement.appendChild(child);
      });
    };

    if (settings.header_scripts) {
      injectScripts(settings.header_scripts, 'header', document.head);
    }

    if (settings.footer_scripts) {
      injectScripts(settings.footer_scripts, 'footer', document.body);
    }

  }, [settings, isLoading]);

  return null; // This component does not render anything itself.
};

export default PageMetadata;