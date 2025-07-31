import { useQuery } from "@tanstack/react-query";
import { getPendingGifs } from "@/services/api";
import { DataTable } from "@/components/admin/DataTable";
import { columns } from "./GifSubmissionsColumns";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";
import { useReactTable, getCoreRowModel, getPaginationRowModel } from "@tanstack/react-table";

const AdminGifSubmissionsPage = () => {
  const { t } = useTranslation();
  const { data: gifs, isLoading, error } = useQuery({
    queryKey: ["pendingGifs"],
    queryFn: getPendingGifs,
  });

  const table = useReactTable({
    data: gifs || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t("admin.gif_submissions.title")}</h2>
        <p className="text-muted-foreground mb-6">
          {t("admin.gif_submissions.description")}
        </p>
        <div className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{t("admin.gif_submissions.fetch_error")}: {error.message}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{t("admin.gif_submissions.title")}</h2>
      <p className="text-muted-foreground mb-6">
        {t("admin.gif_submissions.description")}
      </p>
      <DataTable
        table={table}
        columns={columns}
      />
    </div>
  );
};

export default AdminGifSubmissionsPage;