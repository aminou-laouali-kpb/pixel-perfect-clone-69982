import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabase-config";

// Replaces the generated attacher so a missing backend config never throws on
// every server function call. It also has to stay non-blocking: the config
// lookup is itself a server function, so this middleware must never await it.
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    if (!isSupabaseConfigured()) {
      return next({ headers: {} });
    }

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
    } catch {
      return next({ headers: {} });
    }
  },
);
