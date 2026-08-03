import { createFileRoute, Outlet, redirect, isRedirect } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { ensureRuntimeSupabaseConfig } from "@/lib/supabase-config";
import type { Profile } from "@/types";

export type AuthenticatedContext = {
  user: { id: string; email?: string | null };
  profile: Profile | null;
};

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }): Promise<AuthenticatedContext> => {
    // `location.search` is the parsed object, not a string: interpolating it
    // throws and would escape the guard below, so build the target from `href`.
    const loginRedirect = () => redirect({ to: "/login", search: { redirect: location.href } });

    try {
      if (!(await ensureRuntimeSupabaseConfig())) {
        throw loginRedirect();
      }

      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        throw loginRedirect();
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();

      return {
        user: data.user,
        profile: (profileData as Profile | null) ?? null,
      };
    } catch (error) {
      // Any unexpected failure (missing backend config, network) must land on the
      // login screen instead of tearing down the whole app with an error page.
      if (isRedirect(error)) throw error;
      throw loginRedirect();
    }
  },
  component: () => <Outlet />,
});
