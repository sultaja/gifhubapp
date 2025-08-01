import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateGif, deleteGif } from "@/services/api";
import { showSuccess, showError } from "@/utils/toast";
import { useTranslation } from "react-i18next";
import { Gif } from "@/types";

export const useApproveGif = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string, values: Partial<Gif> }) => updateGif(id, values),
    onSuccess: () => {
      showSuccess(t("admin.gif_submissions.toast.approved"));
      queryClient.invalidateQueries({ queryKey: ["pendingGifs"] });
      queryClient.invalidateQueries({ queryKey: ["adminGifs"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error: Error) => {
      showError(error.message || t("admin.gif_submissions.toast.error_approve"));
    },
  });
};

export const useRejectGif = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteGif(id),
    onSuccess: () => {
      showSuccess(t("admin.gif_submissions.toast.rejected"));
      queryClient.invalidateQueries({ queryKey: ["pendingGifs"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
    },
    onError: (error: Error) => {
      showError(error.message || t("admin.gif_submissions.toast.error_reject"));
    },
  });
};