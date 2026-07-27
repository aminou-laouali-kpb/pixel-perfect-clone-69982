import { toast } from "sonner";

type ToastType = "success" | "error" | "info";

/** Thin wrapper around Sonner — no separate ToastProvider needed. */
export const useToast = () => ({
  showToast: (message: string, type: ToastType = "info") => {
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else toast(message);
  },
});

export default useToast;
