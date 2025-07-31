import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory, deleteCategories } from "@/services/api";
import { Category } from "@/types";
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
import { CategoryDialog, CategoryFormValues } from "@/components/admin/CategoryDialog";
import { TranslationDialog } from "@/components/admin/TranslationDialog";
import { useTranslation } from "react-i18next";

const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const { data: categories, isLoading } = useQuery({
    queryKey: ["adminCategories"],
    queryFn: getCategories,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
      queryClient.invalidateQueries({ queryKey: ["hierarchicalCategories"] });
      setRowSelection({});
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  };

  const createMutation = useMutation({
    mutationFn: (newCategory: Omit<Category, 'id'>) => createCategory(newCategory),
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptions.onSuccess(...args);
      showSuccess(t('admin.categories.toast_create_success'));
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string, values: CategoryFormValues }) => updateCategory(id, values),
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptions.onSuccess(...args);
      showSuccess(t('admin.categories.toast_update_success'));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptions.onSuccess(...args);
      showSuccess(t('admin.categories.toast_delete_success'));
    }
  });

  const deleteManyMutation = useMutation({
    mutationFn: (ids: string[]) => deleteCategories(ids),
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptions.onSuccess(...args);
      showSuccess(t('admin.categories.toast_delete_many_success'));
    }
  });

  const handleSave = (values: CategoryFormValues, categoryId?: string) => {
    const categoryData = {
      ...values,
      parent_id: values.parent_id || null,
    };

    if (categoryId) {
      updateMutation.mutate({ id: categoryId, values: categoryData });
    } else {
      createMutation.mutate({ ...categoryData, category_translations: [] });
    }
  };

  const columns: ColumnDef<Category>[] = [
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
          {t('admin.categories.col_name')}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const isSubCategory = !!row.original.parent_id;
        return (
          <span className={isSubCategory ? "pl-4" : ""}>
            {isSubCategory && "↳ "}
            {row.original.name}
          </span>
        );
      },
    },
    {
      accessorKey: "slug",
      header: t('admin.categories.col_slug'),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const category = row.original;
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
                <CategoryDialog
                  category={category}
                  onSave={handleSave}
                  isSaving={updateMutation.isPending}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    {t('admin.dialog_shared.edit')}
                  </DropdownMenuItem>
                </CategoryDialog>
                <TranslationDialog item={category} type="category">
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
                        {t('admin.categories.delete_single_confirm')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('admin.dialog_shared.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(category.id)}>
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
    data: categories || [],
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
        <h1 className="text-3xl font-bold">{t('admin.categories.title')}</h1>
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
                    {t('admin.categories.delete_many_confirm', { count: selectedIds.length })}
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
          <CategoryDialog onSave={handleSave} isSaving={createMutation.isPending}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('admin.categories.add_new')}
            </Button>
          </CategoryDialog>
        </div>
      </div>
      {isLoading && (
        <div className="rounded-md border p-4">
          <div className="w-full text-center p-4">{t('admin.categories.loading')}</div>
        </div>
      )}
      {!isLoading && <DataTable table={table} columns={columns} />}
    </div>
  );
};

export default AdminCategoriesPage;