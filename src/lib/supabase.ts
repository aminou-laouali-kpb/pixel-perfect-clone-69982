// Thin alias that re-exports the Lovable Cloud-managed Supabase client so the
// ported code (which imports from `@/lib/supabase`) keeps working unchanged.
export { supabase } from "@/integrations/supabase/client";
export { isSupabaseConfigured } from "@/lib/supabase-config";

import { isSupabaseConfigured } from "@/lib/supabase-config";

export const supabaseConfig = {
  get isConfigured() {
    return isSupabaseConfigured();
  },
} as const;
