import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { CLOUD_BACKEND_UNAVAILABLE_MESSAGE } from "@/lib/supabase-config";

/**
 * Non-blocking banner shown when the app was built without Lovable Cloud
 * backend env. Public pages keep rendering normally.
 */
export const ConfigBanner: React.FC = () => {
  const { configError } = useAuth();
  if (!configError) return null;

  return (
    <div
      role="alert"
      className="border-b border-gold-500/40 bg-gold-500/10 px-4 py-2 text-center text-sm text-gold-200"
    >
      {CLOUD_BACKEND_UNAVAILABLE_MESSAGE}
    </div>
  );
};

export default ConfigBanner;
