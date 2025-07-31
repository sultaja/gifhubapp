import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTags, createTag, updateTag, deleteTag, deleteTags } from "@/services/api";
import { Tag } from "@/types";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef, RowSelectionState, SortingState, useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, PlusCircle, Edit, Trash2, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
import { Checkbox } from "@/components/ui/checkbox";
import { showSuccess, showError } from "@/utils/toast";
import { TagDialog, TagFormValues } from "@/components/admin/TagDialog";
import { TranslationDialog } from "@/components/admin/TranslationDialog";
import { useTranslation } from "react-i18next";

const AdminTagsPage = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const { data: tags, isLoading } = useQuery({
    queryKey: ["adminTags"],
    queryFn: getTags,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTags"] });
      setRowSelection({});
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  };

  const createMutation = useMutation({
    mutationFn: (newTag: Omit<Tag, 'id'>) => createTag(newTag),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      showSuccess(t('admin.tags.toast_create_success'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string, values: TagFormValues }) => updateTag(id, values),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      showSuccess(t('admin.tags.toast_update_success'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTag(id),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      showSuccess(t('admin.tags.toast_delete_success'));
    }
  });

  const deleteManyMutation = useMutation({
    mutationFn: (ids: string[]) => deleteTags(ids),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      showSuccess(t('admin.tags.toast_delete_many_success'));
    }
  });

  const handleSave = (values: TagFormValues, tagId?: string) => {
    if (tagId) {
      updateMutation.mutate({ id: tagId, values });
    } else {
      createMutation.mutate({
        name: values.name,
        slug: values.slug,
        tag_translations: [],
      });
    }
  };

  const columns: ColumnDef<Tag>[] = [
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
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t('admin.tags.col_name')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "slug",
      header: t('admin.tags.col_slug'),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const tag = row.original;
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
                <TagDialog
                  tag={tag}
                  onSave={handleSave}
                  isSaving={updateMutation.isPending}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('admin.dialog_shared.edit')}
                  </DropdownMenuItem>
                </TagDialog>
                <TranslationDialog item={tag} type="tag">
                   <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Languages className="mr-2 h-4 w-4" />
                    {t('admin.dialog_shared.translate')}
                  </DropdownMenuItem>
                </TranslationDialog>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-destructive"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t('admin.dialog_shared.delete')}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('admin.dialog_shared.are_you_sure')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('admin.tags.delete_single_confirm')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('admin.dialog_shared.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(tag.id)}>
                        {t('admin.dialog_shared.continue')}
                      </AlertDialogAction>
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
    data: tags || [],
    columns,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      rowSelection,
    },
  });

  const selectedIds = table.getSelectedRowModel().rows.map(row => row.original.id);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('admin.tags.title')}</h1>
        <div className="flex items-center space-x-2">
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
                  <AlertDialogDescription>
                    {t('admin.tags.delete_many_confirm', { count: selectedIds.length })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('admin.dialog_shared.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteManyMutation.mutate(selectedIds)}>
                    {t('admin.dialog_shared.continue')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <TagDialog onSave={handleSave} isSaving={createMutation.isPending}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('admin.tags.add_new')}
            </Button>
          </TagDialog>
        </div>
      </div>
      {isLoading && (
        <div className="rounded-md border p-4">
          <div className="w-full text-center p-4">{t('admin.tags.loading')}</div>
        </div>
      )}
      {!isLoading && <DataTable table={table} columns={columns} />}
    </div>
  );
};

export default AdminTagsPage;