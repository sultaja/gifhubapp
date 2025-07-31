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
    // Load default translations immediately
    resources: defaultTranslations,
  });

// Fetch translations from the database and merge them
getUiTranslations().then(async (dbTranslations) => {
  if (dbTranslations) {
    // If no translations exist in the DB, seed it with the default set.
    if (dbTranslations.length === 0) {
      console.log("No UI translations found in DB, seeding with defaults...");
      const seedingPromises = Object.entries(defaultTranslations).map(([lang, content]) => {
        return upsertUiTranslation(lang, content);
      });
      try {
        await Promise.all(seedingPromises);
        console.log("Default translations seeded successfully.");
      } catch (error) {
        console.error("Error seeding translations:", error);
      }
    } else {
      // Merge DB translations over the defaults
      dbTranslations.forEach(t => {
        i18n.addResourceBundle(t.lang_code, 'translation', t.translations, true, true);
      });
    }
    // This ensures the app re-renders with the latest translations
    i18n.changeLanguage(i18n.language);
  }
});

export default i18n;