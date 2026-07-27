// Thin alias that re-exports the Lovable Cloud-managed Supabase client so the
// ported code (which imports from `@/lib/supabase`) keeps working unchanged.
export { supabase } from "@/integrations/supabase/client";

export const supabaseConfig = { isConfigured: true } as const;
