import React from "react";
import { toast } from "sonner";

type ToastType = "success" | "error" | "info";

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

export const useToast = () => ({
  showToast: (message: string, type: ToastType = "info") => {
    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);
    else toast(message);
  },
});

export default useToast;