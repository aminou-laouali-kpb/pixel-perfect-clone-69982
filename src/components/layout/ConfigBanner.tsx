import React from "react";
import { useAuth } from "@/hooks/useAuth";

/**
 * Non-blocking banner shown when the app was built without backend
 * configuration. Public pages keep rendering normally.
 */
export const ConfigBanner: React.FC = () => {
  const { configError } = useAuth();
  if (!configError) return null;

  return (
    <div
      role="alert"
      className="border-b border-gold-500/40 bg-gold-500/10 px-4 py-2 text-center text-sm text-gold-200"
    >
      La connexion au service est momentanément indisponible. Rechargez la page dans quelques
      instants&nbsp;; les fonctionnalités de compte sont désactivées.
    </div>
  );
};

export default ConfigBanner;
