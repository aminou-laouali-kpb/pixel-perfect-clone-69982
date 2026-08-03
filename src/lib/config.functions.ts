import { createServerFn } from "@tanstack/react-start";
import type { PublicBackendConfig } from "@/lib/supabase-config";

// Only the publishable key is ever returned here — never the service role key.
export const getPublicBackendConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicBackendConfig> => {
    const { readPublicBackendConfig } = await import("@/lib/public-config.server");
    return readPublicBackendConfig();
  },
);
