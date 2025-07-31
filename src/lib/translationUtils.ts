export const getTranslatedName = (
  item: { name: string; [key: string]: any } | null | undefined,
  lang: string,
  translationsKey: 'category_translations' | 'tag_translations'
) => {
  if (!item) return "";
  const translations = item[translationsKey] || [];
  const translation = translations.find((t: any) => t.language_code === lang);
  return translation?.name || item.name;
};

export const getTranslatedTitle = (
  item: { title: string; [key: string]: any } | null | undefined,
  lang: string
) => {
  if (!item) return "";
  const translations = item.gif_translations || [];
  const translation = translations.find((t: any) => t.language_code === lang);
  return translation?.title || item.title;
};