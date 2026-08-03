import { getPublicBackendConfig } from "@/lib/config.functions";

export type PublicBackendConfig = {
  supabaseUrl: string | null;
  supabasePublishableKey: string | null;
};

export type SupabaseCredentials = {
  url: string;
  publishableKey: string;
};

/** User-facing copy when neither the build nor the server can provide the backend config. */
export const CLOUD_BACKEND_UNAVAILABLE_MESSAGE =
  "Le backend Lovable Cloud n’est pas disponible dans cette version de l’app. Dans Lovable : vérifiez que Cloud est activé, puis republiez / régénérez la preview (un simple rechargement ne suffit pas).";

export function isCloudBackendConfigError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return (
    /Missing Supabase environment variable/i.test(message) ||
    /Connect Supabase in Lovable Cloud/i.test(message) ||
    message === CLOUD_BACKEND_UNAVAILABLE_MESSAGE
  );
}

/**
 * Credentials baked into the bundle at build time. On the browser these only
 * exist when VITE_SUPABASE_* were present during `vite build`; on the server the
 * process.env fallback also resolves.
 */
function readBuildTimeCredentials(): SupabaseCredentials | null {
  const url = import.meta.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const publishableKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_PUBLISHABLE_KEY;
  return url && publishableKey ? { url, publishableKey } : null;
}

let runtimeCredentials: SupabaseCredentials | null = null;
let runtimeLookup: Promise<SupabaseCredentials | null> | null = null;

/** Stores config resolved server-side so the browser can use it without a rebuild. */
export function setRuntimeSupabaseConfig(config: PublicBackendConfig | null | undefined): void {
  if (!config?.supabaseUrl || !config.supabasePublishableKey) return;
  runtimeCredentials = {
    url: config.supabaseUrl,
    publishableKey: config.supabasePublishableKey,
  };
}

export function getSupabaseCredentials(): SupabaseCredentials | null {
  return readBuildTimeCredentials() ?? runtimeCredentials;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseCredentials() !== null;
}

/**
 * Resolves the backend config, asking the server once when the bundle was built
 * without VITE_SUPABASE_*. Safe to call repeatedly: the lookup is memoized.
 */
export async function ensureRuntimeSupabaseConfig(): Promise<SupabaseCredentials | null> {
  const existing = getSupabaseCredentials();
  if (existing) return existing;

  if (!runtimeLookup) {
    runtimeLookup = getPublicBackendConfig()
      .then((config) => {
        setRuntimeSupabaseConfig(config);
        return getSupabaseCredentials();
      })
      .catch(() => null);
  }

  return runtimeLookup;
}
