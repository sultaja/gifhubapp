import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGifs, createGif, updateGif, deleteGif, deleteGifs } from "@/services/api";
import { Gif } from "@/types";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef, RowSelectionState, SortingState, useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, PlusCircle, Edit, Trash2, Star, Languages } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast";
import { GifDialog, GifFormValues } from "@/components/admin/GifDialog";
import { TranslationDialog } from "@/components/admin/TranslationDialog";

const AdminGifsPage = () => {
  const queryClient = useQueryClient();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const { data: gifs, isLoading } = useQuery({
    queryKey: ["adminGifs"],
    queryFn: getGifs,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminGifs"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      setRowSelection({});
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  };

  const createMutation = useMutation({
    mutationFn: (newGif: GifFormValues) => createGif(newGif),
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptions.onSuccess(...args);
      showSuccess("GIF created successfully!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string, values: GifFormValues }) => updateGif(id, values),
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptions.onSuccess(...args);
      showSuccess("GIF updated successfully!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGif(id),
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptions.onSuccess(...args);
      showSuccess("GIF deleted successfully!");
    }
  });

  const deleteManyMutation = useMutation({
    mutationFn: (ids: string[]) => deleteGifs(ids),
    ...mutationOptions,
    onSuccess: (...args) => {
      mutationOptions.onSuccess(...args);
      showSuccess("Selected GIFs deleted successfully!");
    }
  });

  const handleSave = (values: GifFormValues, gifId?: string) => {
    if (gifId) {
      updateMutation.mutate({ id: gifId, values });
    } else {
      createMutation.mutate(values);
    }
  };

  const columns: ColumnDef<Gif>[] = [
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
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title (Default)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "is_featured",
      header: "Featured",
      cell: ({ row }) => {
        return row.original.is_featured ? <Star className="h-4 w-4 text-yellow-500" /> : null;
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const category = row.original.category;
        return <div>{category ? category.name : "Uncategorized"}</div>;
      },
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }) => {
        const tags = row.original.tags;
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {tags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.name}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const gif = row.original;
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
                <GifDialog
                  gif={gif}
                  onSave={handleSave}
                  isSaving={updateMutation.isPending}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </GifDialog>
                 <TranslationDialog item={gif} type="gif">
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
                        This action cannot be undone. This will permanently delete the GIF.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(gif.id)}>
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
    data: gifs || [],
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
        <h1 className="text-3xl font-bold">Manage GIFs</h1>
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
                    This action cannot be undone. This will permanently delete {selectedIds.length} GIF(s).
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
          <GifDialog onSave={handleSave} isSaving={createMutation.isPending}>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New GIF
            </Button>
          </GifDialog>
        </div>
      </div>
      {isLoading && (
        <div className="rounded-md border p-4">
          <div className="w-full text-center p-4">Loading GIFs...</div>
        </div>
      )}
      {!isLoading && <DataTable table={table} columns={columns} />}
    </div>
  );
};

export default AdminGifsPage;