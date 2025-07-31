import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUiTranslations, upsertUiTranslation } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showSuccess, showError } from "@/utils/toast";
import { supportedLngs } from "@/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo, useState } from "react";

const AdminTranslationsPage = () => {
  const queryClient = useQueryClient();
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["uiTranslations"],
    queryFn: getUiTranslations,
    onSuccess: (data) => {
      const initialTranslations: Record<string, string> = {};
      for (const lang of Object.keys(supportedLngs)) {
        const t = data.find(d => d.lang_code === lang);
        initialTranslations[lang] = t ? JSON.stringify(t.translations, null, 2) : "{}";
      }
      setTranslations(initialTranslations);
    }
  });

  const mutation = useMutation({
    mutationFn: ({ lang, content }: { lang: string, content: object }) => upsertUiTranslation(lang, content),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["uiTranslations"] });
      showSuccess(`Translations for ${supportedLngs[data.lang_code as keyof typeof supportedLngs]} saved!`);
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const handleSave = (lang: string) => {
    try {
      const parsedContent = JSON.parse(translations[lang]);
      mutation.mutate({ lang, content: parsedContent });
    } catch (e) {
      showError("Invalid JSON format. Please check your syntax.");
    }
  };

  const handleTextChange = (lang: string, value: string) => {
    setTranslations(prev => ({ ...prev, [lang]: value }));
  };

  if (isLoading) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-6">UI Translations</h1>
        <Skeleton className="w-full h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">UI Translations</h1>
      <Card>
        <CardHeader>
          <CardTitle>Edit UI Text</CardTitle>
          <CardDescription>
            Manage the text for buttons, labels, and other interface elements across the site.
            Please use valid JSON format. You can copy the structure from the English (en) tab to get started.
          </CardDescription>
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
                    {mutation.isPending ? "Saving..." : `Save ${supportedLngs[code as keyof typeof supportedLngs]} Translations`}
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