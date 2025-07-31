import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { getUiTranslations, upsertUiTranslation } from "./services/api";
import { defaultTranslations } from "./lib/default-translations";

export const supportedLngs = {
  en: "English",
  tr: "Türkçe",
  ru: "Русский",
  az: "Azərbaycanca",
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: Object.keys(supportedLngs),
    fallbackLng: "en",
    detection: {
      order: ["path", "cookie", "htmlTag", "localStorage", "subdomain"],
      caches: ["cookie"],
    },
    react: {
      useSuspense: false,
    },
  });

// Fetch translations from the database and load them into i18next
getUiTranslations().then(translations => {
  if (translations) {
    // If no translations exist in the DB, seed it with the default set.
    if (translations.length === 0) {
      console.log("No UI translations found in DB, seeding with defaults...");
      Object.entries(defaultTranslations).forEach(([lang, content]) => {
        upsertUiTranslation(lang, content);
        i18n.addResourceBundle(lang, 'translation', content, true, true);
      });
    } else {
      translations.forEach(t => {
        i18n.addResourceBundle(t.lang_code, 'translation', t.translations, true, true);
      });
    }
    // This ensures the app re-renders with the loaded translations
    i18n.changeLanguage(i18n.language);
  }
});

export default i18n;