/**
 * Detects whether the Lovable Cloud backend variables were injected at build time.
 * Used to degrade gracefully instead of crashing the whole app when a build was
 * produced before Cloud was connected / before a republish.
 */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;
  return Boolean(url && key);
}

/** User-facing copy when the published/preview build has no Cloud backend env. */
export const CLOUD_BACKEND_UNAVAILABLE_MESSAGE =
  "Le backend Lovable Cloud n’est pas disponible dans cette version de l’app. Dans Lovable : vérifiez que Cloud est activé, puis republiez / régénérez la preview (un simple rechargement ne suffit pas).";

export function isCloudBackendConfigError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return (
    /Missing Supabase environment variable/i.test(message) ||
    /Connect Supabase in Lovable Cloud/i.test(message)
  );
}
