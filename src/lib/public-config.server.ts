import type { PublicBackendConfig } from "@/lib/supabase-config";

// Server-only reader for the public backend configuration.
// Lovable Cloud injects SUPABASE_* as worker runtime bindings, while the browser
// bundle only ever receives VITE_*-prefixed values frozen at build time. Reading
// these at request time lets a build produced without VITE_* still work.
export function readPublicBackendConfig(): PublicBackendConfig {
  return {
    supabaseUrl: process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? null,
    supabasePublishableKey:
      process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? null,
  };
}
