import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUiTranslations, upsertUiTranslation } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showSuccess, showError } from "@/utils/toast";
import { supportedLngs } from "@/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { defaultTranslations } from "@/lib/default-translations";
import { useTranslation } from "react-i18next";

const AdminTranslationsPage = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const { data: dbTranslations, isLoading } = useQuery({
    queryKey: ["uiTranslations"],
    queryFn: getUiTranslations,
  });

  useEffect(() => {
    if (dbTranslations) {
      const initialTranslations: Record<string, string> = {};
      for (const lang of Object.keys(supportedLngs)) {
        const dbLangData = dbTranslations.find(d => d.lang_code === lang);
        if (dbLangData) {
          initialTranslations[lang] = JSON.stringify(dbLangData.translations, null, 2);
        } else {
          // Fallback to default translations if not in DB
          initialTranslations[lang] = JSON.stringify(defaultTranslations[lang as keyof typeof defaultTranslations] || {}, null, 2);
        }
      }
      setTranslations(initialTranslations);
    }
  }, [dbTranslations]);

  const mutation = useMutation({
    mutationFn: ({ lang, content }: { lang: string, content: object }) => upsertUiTranslation(lang, content),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["uiTranslations"] });
      showSuccess(t('admin.translations.toast_save_success', { lang: supportedLngs[data.lang_code as keyof typeof supportedLngs] }));
    },
    onError: (error: Error) => {
      showError(t('admin.translations.toast_json_error'));
      console.error(error);
    },
  });

  const handleSave = (lang: string) => {
    try {
      const parsedContent = JSON.parse(translations[lang]);
      mutation.mutate({ lang, content: parsedContent });
    } catch (e) {
      showError(t('admin.translations.toast_json_error'));
    }
  };

  const handleTextChange = (lang: string, value: string) => {
    setTranslations(prev => ({ ...prev, [lang]: value }));
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">{t('admin.translations.title')}</h1>
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('admin.translations.title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.translations.page_title')}</CardTitle>
          <CardDescription>{t('admin.translations.page_desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={Object.keys(supportedLngs)[0]} className="w-full">
            <TabsList>
              {Object.entries(supportedLngs).map(([code, name]) => (
                <TabsTrigger key={code} value={code}>{name}</TabsTrigger>
              ))}
            </TabsList>
            {Object.keys(supportedLngs).map(code => (
              <TabsContent key={code} value={code}>
                <div className="space-y-4 p-1">
                  <Textarea
                    value={translations[code] || ""}
                    onChange={(e) => handleTextChange(code, e.target.value)}
                    rows={20}
                    placeholder={`{ "key": "value" }`}
                  />
                  <Button onClick={() => handleSave(code)} disabled={mutation.isPending}>
                    {mutation.isPending ? t('admin.dialog_shared.saving') : t('admin.translations.save_button', { lang: supportedLngs[code as keyof typeof supportedLngs] })}
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTranslationsPage;