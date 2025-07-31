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

const AdminCategoriesPage = () => {
  const queryClient = useQueryClient();
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
      showSuccess("Category created successfully!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string, values: CategoryFormValues }) => updateCategory(id, values),
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptions.onSuccess(...args);
      showSuccess("Category updated successfully!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptions.onSuccess(...args);
      showSuccess("Category deleted successfully!");
    }
  });

  const deleteManyMutation = useMutation({
    mutationFn: (ids: string[]) => deleteCategories(ids),
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptions.onSuccess(...args);
      showSuccess("Selected categories deleted successfully!");
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
          Name (Default)
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
      header: "Slug",
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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <CategoryDialog
                  category={category}
                  onSave={handleSave}
                  isSaving={updateMutation.isPending}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </CategoryDialog>
                <TranslationDialog item={category} type="category">
                   <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Languages className="mr-2 h-4 w-4" />
                    Translate
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
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        category. If it has sub-categories, they will become top-level categories.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(category.id)}>
                        Continue
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
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <div className="flex items-center space-x-2">
          {selectedIds.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete ({selectedIds.length})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {selectedIds.length} category(s).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteManyMutation.mutate(selectedIds)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <CategoryDialog onSave={handleSave} isSaving={createMutation.isPending}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Category
            </Button>
          </CategoryDialog>
        </div>
      </div>
      {isLoading && (
        <div className="rounded-md border p-4">
          <div className="w-full text-center p-4">Loading Categories...</div>
        </div>
      )}
      {!isLoading && <DataTable columns={columns} data={categories || []} />}
    </div>
  );
};

export default AdminCategoriesPage;