/**
 * Detects whether the backend connection variables were injected at build time.
 * Used to degrade gracefully instead of crashing the whole app when a build was
 * produced before the backend was connected.
 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key);
}
