import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStats } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { GitFork, Tag, FolderKanban } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: getStats,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{t('admin.dashboard.title')}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.dashboard.total_gifs')}</CardTitle>
            <GitFork className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats?.gifsCount}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('admin.dashboard.total_categories')}
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats?.categoriesCount}</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('admin.dashboard.total_tags')}</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? <Skeleton className="h-8 w-1/4" /> : <div className="text-2xl font-bold">{stats?.tagsCount}</div>}
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">{t('admin.dashboard.welcome_title')}</h2>
        <p className="text-muted-foreground">
          {t('admin.dashboard.welcome_subtitle')}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;