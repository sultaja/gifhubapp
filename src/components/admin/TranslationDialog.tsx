import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import { supportedLngs } from "@/i18n";
import { upsertCategoryTranslations, upsertTagTranslations, upsertGifTranslations } from "@/services/api";
import { useTranslation } from "react-i18next";

type TranslatableItem = {
  id: string;
  [key: string]: any;
};

type TranslationType = 'category' | 'tag' | 'gif';

interface TranslationDialogProps {
  children: React.ReactNode;
  item: TranslatableItem;
  type: TranslationType;
}

export function TranslationDialog({ children, item, type }: TranslationDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const queryClient = useQueryClient();

  const getTranslationKey = (t: TranslationType) => {
    if (t === 'category') return 'category_translations';
    if (t === 'tag') return 'tag_translations';
    return 'gif_translations';
  }

  const getTranslatableFields = (t: TranslationType) => {
    if (t === 'gif') return ['title'];
    return ['name'];
  }

  const getUpsertFunction = (t: TranslationType) => {
    if (t === 'category') return upsertCategoryTranslations;
    if (t === 'tag') return upsertTagTranslations;
    return upsertGifTranslations;
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      const initialTranslations: Record<string, Record<string, string>> = {};
      const existingTranslations = item[getTranslationKey(type)] || [];
      
      for (const langCode of Object.keys(supportedLngs)) {
        initialTranslations[langCode] = {};
        const t = existingTranslations.find((t: any) => t.language_code === langCode);
        for (const field of getTranslatableFields(type)) {
            initialTranslations[langCode][field] = t ? t[field] : '';
        }
      }
      setTranslations(initialTranslations);
    }
    setOpen(isOpen);
  };

  const mutation = useMutation({
    mutationFn: (data: any[]) => getUpsertFunction(type)(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`admin${type.charAt(0).toUpperCase() + type.slice(1)}s`] });
      queryClient.invalidateQueries({ queryKey: [type, item.id] });
      showSuccess("Translations saved successfully!");
      setOpen(false);
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const handleSave = () => {
    const payload = [];
    const idField = `${type}_id`;

    for (const langCode in translations) {
      const translatableFields = getTranslatableFields(type);
      const hasContent = translatableFields.some(field => translations[langCode][field]?.trim());

      if (hasContent) {
        payload.push({
          [idField]: item.id,
          language_code: langCode,
          ...translations[langCode],
        });
      }
    }
    mutation.mutate(payload);
  };

  const handleInputChange = (lang: string, field: string, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('admin.translation_dialog.title')}</DialogTitle>
          <DialogDescription>
            {t('admin.translation_dialog.description', { item: item.name || item.title })}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={Object.keys(supportedLngs)[0]} className="w-full">
          <TabsList>
            {Object.entries(supportedLngs).map(([code, name]) => (
              <TabsTrigger key={code} value={code}>{name}</TabsTrigger>
            ))}
          </TabsList>
          {Object.keys(supportedLngs).map(code => (
            <TabsContent key={code} value={code}>
              <div className="space-y-4 p-1">
                {getTranslatableFields(type).map(field => (
                    <div key={field} className="space-y-2">
                        <Label htmlFor={`${code}-${field}`} className="capitalize">{field}</Label>
                        <Input
                            id={`${code}-${field}`}
                            value={translations[code]?.[field] || ''}
                            onChange={(e) => handleInputChange(code, field, e.target.value)}
                        />
                    </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">{t('admin.dialog_shared.cancel')}</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={mutation.isPending}>
            {mutation.isPending ? t('admin.dialog_shared.saving') : t('admin.translation_dialog.save_button')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}