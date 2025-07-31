import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getContentSection } from '@/services/api';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';

interface ContentPageProps {
  sectionKey: string;
  defaultTitle: string;
}

const ContentPage = ({ sectionKey, defaultTitle }: ContentPageProps) => {
  const { i18n } = useTranslation();
  const { data: content, isLoading } = useQuery({
    queryKey: ['contentSection', sectionKey, i18n.language],
    queryFn: () => getContentSection(sectionKey, i18n.language),
  });

  useEffect(() => {
    if (content) {
      document.title = `${content.meta_title || content.title || defaultTitle} - GifHub.App`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription && content.meta_description) {
        metaDescription.setAttribute('content', content.meta_description);
      }
    } else {
      document.title = `${defaultTitle} - GifHub.App`;
    }
  }, [content, defaultTitle]);

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    );
  }

  if (!content || !content.title || !content.content) {
    return (
      <div className="container max-w-4xl py-12">
        <h1 className="text-4xl font-bold mb-4">{defaultTitle}</h1>
        <p>Content for this page has not been configured yet. Please add it in the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-4xl font-bold mb-4">{content.title}</h1>
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: content.content }}
      />
    </div>
  );
};

export default ContentPage;