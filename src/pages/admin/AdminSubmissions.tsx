import { useQuery } from "@tanstack/react-query";
import { getPendingGifs } from "@/services/api";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./submissions/columns";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

const AdminSubmissions = () => {
  const { t } = useTranslation();
  const { data: gifs, isLoading, error } = useQuery({
    queryKey: ["pendingGifs"],
    queryFn: getPendingGifs,
  });

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-4 w-72 mb-8" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{t("errors.fetch_error", { resource: 'submissions' })}: {error.message}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{t("admin_submissions.title")}</h2>
      <p className="text-muted-foreground mb-6">
        {t("admin_submissions.description")}
      </p>
      <DataTable
        columns={columns}
        data={gifs || []}
        filterColumn="title"
        emptyStateMessage={t("admin_submissions.empty_state")}
      />
    </div>
  );
};

export default AdminSubmissions;