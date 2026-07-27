import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types";

export type AuthenticatedContext = {
  user: { id: string; email?: string | null };
  profile: Profile | null;
};

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }): Promise<AuthenticatedContext> => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({
        to: "/login",
        search: { redirect: `${location.pathname}${location.search}` },
      });
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
  },
  component: () => <Outlet />,
});
