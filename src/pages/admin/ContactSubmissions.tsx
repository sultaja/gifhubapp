import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getContactSubmissions, updateContactSubmission, deleteContactSubmission, deleteContactSubmissions } from "@/services/api";
import { ContactSubmission } from "@/types";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef, RowSelectionState, SortingState, useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Trash2, Eye, Mail, MailOpen } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";

const AdminContactSubmissionsPage = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "submitted_at", desc: true }]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["contactSubmissions"],
    queryFn: getContactSubmissions,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contactSubmissions"] });
      setRowSelection({});
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number, values: Partial<ContactSubmission> }) => updateContactSubmission(id, values),
    ...mutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteContactSubmission(id),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      showSuccess(t('admin.submissions.toast_delete_success'));
    }
  });

  const deleteManyMutation = useMutation({
    mutationFn: (ids: number[]) => deleteContactSubmissions(ids),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      showSuccess(t('admin.submissions.toast_delete_many_success'));
    }
  });

  const columns: ColumnDef<ContactSubmission>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },
    {
      accessorKey: "is_read",
      header: t('admin.submissions.col_status'),
      cell: ({ row }) => {
        const isRead = row.original.is_read;
        return <Badge variant={isRead ? "secondary" : "default"}>{isRead ? t('admin.submissions.status_read') : t('admin.submissions.status_unread')}</Badge>;
      },
    },
    {
      accessorKey: "name",
      header: t('admin.submissions.col_name'),
    },
    {
      accessorKey: "email",
      header: t('admin.submissions.col_email'),
    },
    {
      accessorKey: "submitted_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('admin.submissions.col_date')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => format(new Date(row.original.submitted_at), "PPP p"),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const submission = row.original;
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('admin.dialog_shared.actions')}</DropdownMenuLabel>
                <Dialog>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); updateMutation.mutate({ id: submission.id, values: { is_read: true } })}}>
                      <Eye className="mr-2 h-4 w-4" />
                      {t('admin.submissions.view_details')}
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t('admin.submissions.details_title')}</DialogTitle>
                      <DialogDescription>{t('admin.submissions.details_desc', { name: submission.name })}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p><strong>{t('admin.submissions.col_name')}:</strong> {submission.name}</p>
                      <p><strong>{t('admin.submissions.col_email')}:</strong> {submission.email}</p>
                      <p><strong>{t('contact_page.form.company')}:</strong> {submission.company || 'N/A'}</p>
                      <p><strong>{t('contact_page.form.budget')}:</strong> {submission.budget_range || 'N/A'}</p>
                      <p><strong>{t('contact_page.form.details')}:</strong></p>
                      <p className="p-2 bg-muted rounded-md whitespace-pre-wrap">{submission.project_details || 'N/A'}</p>
                    </div>
                  </DialogContent>
                </Dialog>
                <DropdownMenuItem onClick={() => updateMutation.mutate({ id: submission.id, values: { is_read: !submission.is_read } })}>
                  {submission.is_read ? <Mail className="mr-2 h-4 w-4" /> : <MailOpen className="mr-2 h-4 w-4" />}
                  {submission.is_read ? t('admin.submissions.mark_unread') : t('admin.submissions.mark_read')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('admin.dialog_shared.delete')}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('admin.dialog_shared.are_you_sure')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('admin.submissions.delete_single_confirm')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('admin.dialog_shared.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(submission.id)}>{t('admin.dialog_shared.continue')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: submissions || [],
    columns,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting, rowSelection },
  });

  const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('admin.submissions.title')}</h1>
        {selectedIds.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                {t('admin.dialog_shared.delete')} ({selectedIds.length})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('admin.dialog_shared.are_you_sure')}</AlertDialogTitle>
                <AlertDialogDescription>{t('admin.submissions.delete_many_confirm', { count: selectedIds.length })}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('admin.dialog_shared.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteManyMutation.mutate(selectedIds)}>{t('admin.dialog_shared.continue')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {isLoading && <div className="rounded-md border p-4"><div className="w-full text-center p-4">{t('admin.submissions.loading')}</div></div>}
      {!isLoading && <DataTable table={table} columns={columns} />}
    </div>
  );
};

export default AdminContactSubmissionsPage;