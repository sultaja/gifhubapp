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
      const titlesForLang = (settings.page_titles as any)[i18n.language] || (settings.page_titles as any)['en'] || {};
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

    const headerScriptsContainerId = 'dyad-header-scripts';
    const footerScriptsContainerId = 'dyad-footer-scripts';

    // This function will be returned by the effect to clean up scripts when the component unmounts
    // or before the effect re-runs.
    const cleanup = () => {
      document.getElementById(headerScriptsContainerId)?.remove();
      document.getElementById(footerScriptsContainerId)?.remove();
    };

    const injectScripts = (scriptHTML: string, containerId: string, targetElement: HTMLElement) => {
      // Prevent re-injection if the container already exists (e.g., due to fast refresh).
      if (document.getElementById(containerId)) return;

      const container = document.createElement('div');
      container.id = containerId;
      // Using innerHTML to parse the string into DOM elements.
      container.innerHTML = scriptHTML;
      
      // Scripts inserted via innerHTML are not executed by browsers for security reasons.
      // We must create new script elements and copy the content and attributes over.
      container.querySelectorAll('script').forEach(oldScript => {
        const newScript = document.createElement('script');
        
        // Copy all attributes (src, async, defer, etc.) from the parsed script to the new one.
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copy the inline script content.
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        
        // Replace the non-executable script with our new, executable one.
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
      
      // Append the container with now-executable scripts to the target (head or body).
      targetElement.appendChild(container);
    };

    // Clean up any scripts that might have been injected by a previous render.
    cleanup();

    if (settings.header_scripts) {
      injectScripts(settings.header_scripts, headerScriptsContainerId, document.head);
    }

    if (settings.footer_scripts) {
      injectScripts(settings.footer_scripts, footerScriptsContainerId, document.body);
    }

    return cleanup;
  }, [settings, isLoading]);

  return null; // This component does not render anything itself.
};

export default PageMetadata;