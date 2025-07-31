import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { getUiTranslations, upsertUiTranslation } from "./services/api";
import { resources, defaultTranslations } from "@/lib/translations";

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
    resources,
  });

const recursivelyClean = (obj: any): boolean => {
  let wasModified = false;
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      const original = obj[key];
      // This regex finds {{...}} patterns that are immediately enclosed in double quotes
      // and removes the quotes, fixing the interpolation.
      const cleaned = original.replace(/"(\{\{.*?\}\})"/g, '$1');
      if (original !== cleaned) {
        obj[key] = cleaned;
        wasModified = true;
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (recursivelyClean(obj[key])) {
        wasModified = true;
      }
    }
  }
  return wasModified;
};

getUiTranslations().then(async (dbTranslations) => {
  if (dbTranslations) {
    if (dbTranslations.length === 0) {
      console.log("No UI translations found in DB, seeding with defaults...");
      const seedingPromises = Object.entries(defaultTranslations).map(([lang, content]) => {
        return upsertUiTranslation(lang, content as object);
      });
      try {
        await Promise.all(seedingPromises);
        console.log("Default translations seeded successfully.");
      } catch (error) {
        console.error("Error seeding translations:", error);
      }
    } else {
      const updatePromises: Promise<any>[] = [];
      dbTranslations.forEach(t => {
        const translationsObject = t.translations;
        const wasModified = recursivelyClean(translationsObject);
        if (wasModified) {
          console.log(`Auto-fixing incorrect translation formatting for ${t.lang_code}.`);
          updatePromises.push(upsertUiTranslation(t.lang_code, translationsObject));
        }
        i18n.addResourceBundle(t.lang_code, 'translation', translationsObject, true, true);
      });
      
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }
    }
    i18n.changeLanguage(i18n.language);
  }
});

export default i18n;