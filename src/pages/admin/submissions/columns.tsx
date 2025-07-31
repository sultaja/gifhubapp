import { ColumnDef } from "@tanstack/react-table";
import { GifWithRelations } from "@/types";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useSaveGif, useDeleteGif } from "@/hooks/useAdminGifs";
import { GifDialog, GifFormValues } from "@/components/admin/GifDialog";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";

const ActionsCell = ({ row }: { row: any }) => {
  const gif = row.original as GifWithRelations;
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const saveGifMutation = useSaveGif();
  const deleteGifMutation = useDeleteGif();

  const handleApprove = (values: GifFormValues, gifId?: string) => {
    const payload = {
      ...values,
      id: gifId,
      is_approved: true,
    };
    saveGifMutation.mutate(payload, {
      onSuccess: () => {
        showSuccess(t("admin_submissions.toast.approved"));
        queryClient.invalidateQueries({ queryKey: ["pendingGifs"] });
        queryClient.invalidateQueries({ queryKey: ["gifs"] });
      },
      onError: (error) => {
        showError(error.message || t("admin_submissions.toast.error_approve"));
      },
    });
  };

  const handleReject = () => {
    if (window.confirm(t("admin_submissions.confirm_reject"))) {
      deleteGifMutation.mutate(gif.id, {
        onSuccess: () => {
          showSuccess(t("admin_submissions.toast.rejected"));
        },
        onError: (error) => {
          showError(error.message || t("admin_submissions.toast.error_reject"));
        },
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <GifDialog
        gif={gif}
        onSave={handleApprove}
        isSaving={saveGifMutation.isPending}
      >
        <Button variant="outline" size="sm">
          {t("admin_submissions.approve_button")}
        </Button>
      </GifDialog>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleReject}
        disabled={deleteGifMutation.isPending}
      >
        {t("admin_submissions.reject_button")}
      </Button>
    </div>
  );
};

export const columns: ColumnDef<GifWithRelations>[] = [
  {
    accessorKey: "url",
    header: ({ t }) => t("admin_submissions.columns.gif"),
    cell: ({ row }) => (
      <img
        src={row.original.url}
        alt={row.original.title}
        className="h-16 w-16 rounded-md object-cover"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "title",
    header: ({ column, t }) => (
      <DataTableColumnHeader column={column} title={t("admin_submissions.columns.title")} />
    ),
  },
  {
    accessorKey: "category",
    header: ({ t }) => t("admin_submissions.columns.category"),
    cell: ({ row }) => row.original.category?.name || "N/A",
  },
  {
    accessorKey: "tags",
    header: ({ t }) => t("admin_submissions.columns.tags"),
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.tags.slice(0, 3).map((tag) => (
          <Badge key={tag.id} variant="secondary">
            {tag.name}
          </Badge>
        ))}
        {row.original.tags.length > 3 && (
          <Badge variant="outline">+{row.original.tags.length - 3}</Badge>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column, t }) => (
      <DataTableColumnHeader column={column} title={t("admin_submissions.columns.submitted_at")} />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      return (
        <span>
          {formatDistanceToNow(date, { addSuffix: true })}
        </span>
      );
    },
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];