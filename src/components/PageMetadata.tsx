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
    if (isLoading || !settings) {
      return;
    }

    console.log("PageMetadata: Site settings loaded.", settings);

    const headerScriptsContainerId = 'header-scripts-container';
    const footerScriptsContainerId = 'footer-scripts-container';

    // Cleanup function to remove scripts on re-render or unmount
    const cleanup = () => {
      document.getElementById(headerScriptsContainerId)?.remove();
      document.getElementById(footerScriptsContainerId)?.remove();
      console.log("PageMetadata: Cleaned up old scripts.");
    };
    cleanup(); // Clean up previous scripts first

    const injectScripts = (scriptHTML: string, containerId: string, targetElement: HTMLElement) => {
      console.log(`PageMetadata: Injecting scripts into ${targetElement.tagName} with container #${containerId}`);
      const container = document.createElement('div');
      container.id = containerId;
      container.innerHTML = scriptHTML;
      
      const scripts = container.querySelectorAll('script');
      console.log(`PageMetadata: Found ${scripts.length} script(s) to inject.`);

      scripts.forEach((oldScript, index) => {
        const newScript = document.createElement('script');
        
        // Copy attributes (src, async, defer, etc.)
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copy inline script content
        if (oldScript.innerHTML) {
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        }
        
        // Replace the old script tag with the new, executable one
        oldScript.parentNode?.replaceChild(newScript, oldScript);
        console.log(`PageMetadata: Injected script ${index + 1}.`);
      });
      
      targetElement.appendChild(container);
    };

    if (settings.header_scripts) {
      injectScripts(settings.header_scripts, headerScriptsContainerId, document.head);
    } else {
      console.log("PageMetadata: No header scripts found in settings.");
    }

    if (settings.footer_scripts) {
      injectScripts(settings.footer_scripts, footerScriptsContainerId, document.body);
    } else {
      console.log("PageMetadata: No footer scripts found in settings.");
    }

    return cleanup; // Return cleanup function for React to call on unmount
  }, [settings, isLoading]);

  return null;
};

export default PageMetadata;