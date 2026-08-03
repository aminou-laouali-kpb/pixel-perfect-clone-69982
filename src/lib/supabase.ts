import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  CLOUD_BACKEND_UNAVAILABLE_MESSAGE,
  getSupabaseCredentials,
  isSupabaseConfigured,
} from "@/lib/supabase-config";

// The generated client in `src/integrations/supabase/client.ts` can only read
// build-time VITE_* values, which are missing whenever a bundle was produced
// before Lovable Cloud was connected. This wrapper resolves credentials from the
// build first and falls back to the config the server hands over at runtime.
function createBrowserSupabaseClient(): SupabaseClient<Database> {
  const credentials = getSupabaseCredentials();
  if (!credentials) {
    throw new Error(CLOUD_BACKEND_UNAVAILABLE_MESSAGE);
  }

  return createClient<Database>(credentials.url, credentials.publishableKey, {
    auth: {
      storage: typeof window !== "undefined" ? window.localStorage : undefined,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

let client: SupabaseClient<Database> | undefined;

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop, receiver) {
    if (!client) client = createBrowserSupabaseClient();
    return Reflect.get(client, prop, receiver);
  },
});

export { isSupabaseConfigured };

export const supabaseConfig = {
  get isConfigured() {
    return isSupabaseConfigured();
  },
} as const;
