import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTags, createTag, updateTag, deleteTag } from "@/services/api";
import { Tag } from "@/types";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
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

const AdminTagsPage = () => {
  const queryClient = useQueryClient();

  const { data: tags, isLoading } = useQuery({
    queryKey: ["adminTags"],
    queryFn: getTags,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTags"] });
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  };

  const createMutation = useMutation({
    mutationFn: (newTag: Omit<Tag, 'id' | 'tag_translations'> & { tag_translations: [] }) => createTag(newTag),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      showSuccess("Tag created successfully!");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string, values: TagFormValues }) => updateTag(id, values),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      showSuccess("Tag updated successfully!");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTag(id),
    ...mutationOptions,
    onSuccess: () => {
      mutationOptions.onSuccess();
      showSuccess("Tag deleted successfully!");
    }
  });

  const handleSave = (values: TagFormValues, tagId?: string) => {
    if (tagId) {
      updateMutation.mutate({ id: tagId, values });
    } else {
      // Add the required 'tag_translations' property when creating a new tag
      createMutation.mutate({ ...values, tag_translations: [] });
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
          Name (Default)
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
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
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <TagDialog
                  tag={tag}
                  onSave={handleSave}
                  isSaving={updateMutation.isPending}
                >
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                </TagDialog>
                <TranslationDialog item={tag} type="tag">
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
                        tag and may affect existing GIFs.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteMutation.mutate(tag.id)}>
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

  const tableData = isLoading ? [] : tags || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Tags</h1>
        <TagDialog onSave={handleSave} isSaving={createMutation.isPending}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Tag
          </Button>
        </TagDialog>
      </div>
      {isLoading && (
        <div className="rounded-md border p-4">
          <div className="w-full text-center p-4">Loading Tags...</div>
        </div>
      )}
      {!isLoading && <DataTable columns={columns} data={tableData} />}
    </div>
  );
};

export default AdminTagsPage;