import { ColumnDef } from "@tanstack/react-table";
import { Gif } from "@/types";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { updateGif, deleteGif } from "@/services/api";
import { GifDialog, GifFormValues } from "@/components/admin/GifDialog";
import { Button } from "@/components/ui/button";
import { showSuccess, showError } from "@/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const ActionsCell = ({ row }: { row: any }) => {
  const gif = row.original as Gif;
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string, values: Partial<Gif> }) => updateGif(id, values),
    onSuccess: () => {
        showSuccess(t("admin.gif_submissions.toast.approved"));
        queryClient.invalidateQueries({ queryKey: ["pendingGifs"] });
        queryClient.invalidateQueries({ queryKey: ["adminGifs"] });
    },
    onError: (error: Error) => {
        showError(error.message || t("admin.gif_submissions.toast.error_approve"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGif(id),
    onSuccess: () => {
        showSuccess(t("admin.gif_submissions.toast.rejected"));
        queryClient.invalidateQueries({ queryKey: ["pendingGifs"] });
    },
    onError: (error: Error) => {
        showError(error.message || t("admin.gif_submissions.toast.error_reject"));
    },
  });

  const handleApprove = (values: GifFormValues, gifId?: string) => {
    if (!gifId) return;
    const payload = {
      ...values,
      is_approved: true,
    };
    updateMutation.mutate({ id: gifId, values: payload as Partial<Gif> });
  };

  const handleReject = () => {
    deleteMutation.mutate(gif.id);
  };

  return (
    <div className="flex items-center space-x-2">
      <GifDialog
        gif={gif}
        onSave={handleApprove}
        isSaving={updateMutation.isPending}
      >
        <Button variant="outline" size="sm">
          {t("admin.gif_submissions.approve_button")}
        </Button>
      </GifDialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
            <Button
                variant="destructive"
                size="sm"
                disabled={deleteMutation.isPending}
            >
                {t("admin.gif_submissions.reject_button")}
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.dialog_shared.are_you_sure')}</AlertDialogTitle>
            <AlertDialogDescription>
                {t('admin.gif_submissions.confirm_reject')}
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>{t('admin.dialog_shared.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleReject}>
                {t('admin.dialog_shared.continue')}
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export const columns: ColumnDef<Gif>[] = [
  {
    accessorKey: "url",
    header: "GIF",
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
    header: "Title",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => row.original.category?.name || "N/A",
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1 max-w-xs">
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
    header: "Submitted",
    cell: ({ row }) => {
      if (!row.original.created_at) return null;
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