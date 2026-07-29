import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const AgentEditorSchema = z.object({
  agentId: z.string().uuid(),
  nom: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  whatsapp: z.string().trim().min(5).max(40),
  pays: z.string().trim().min(2).max(80),
  niveau_etudes: z.string().trim().min(1).max(80),
  motivation: z.string().trim().max(1000).nullable().optional(),
});

const AgentDeleteSchema = z.object({
  agentId: z.string().uuid(),
});

const UserEditorSchema = z.object({
  userId: z.string().uuid(),
  nom: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  role: z.enum(["agent", "commercial", "admin"]),
});

const UserDeleteSchema = z.object({
  userId: z.string().uuid(),
});

type AuthedContext = {
  supabase: SupabaseClient<Database>;
  userId: string;
};

async function getCallerRole(context: AuthedContext) {
  const { data, error } = await context.supabase
    .from("profiles")
    .select("role")
    .eq("id", context.userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data?.role) throw new Error("Profil introuvable.");

  return data.role as "agent" | "commercial" | "admin";
}

async function assertAdmin(context: AuthedContext) {
  const role = await getCallerRole(context);
  if (role !== "admin") {
    throw new Error("Action réservée aux administrateurs.");
  }
}

async function assertCanManageAgent(context: AuthedContext, agentId: string) {
  const role = await getCallerRole(context);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: agent, error } = await supabaseAdmin
    .from("agents")
    .select("id, invited_by_user_id")
    .eq("id", agentId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!agent) throw new Error("Agent introuvable.");

  if (role === "admin") return;

  if (role !== "commercial" || agent.invited_by_user_id !== context.userId) {
    throw new Error("Vous ne pouvez gérer que les agents que vous avez invités.");
  }
}

export const listManagedAgents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const role = await getCallerRole(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin.from("agents").select("*").order("created_at", { ascending: false });

    if (role === "commercial") {
      query = query.eq("invited_by_user_id", context.userId);
    } else if (role !== "admin") {
      throw new Error("Action réservée aux commerciaux et administrateurs.");
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return data ?? [];
  });

export const updateManagedAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AgentEditorSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertCanManageAgent(context, data.agentId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existingAuth, error: existingAuthError } =
      await supabaseAdmin.auth.admin.getUserById(data.agentId);
    if (existingAuthError) throw new Error(existingAuthError.message);

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(data.agentId, {
      email: data.email,
      user_metadata: {
        ...(existingAuth.user.user_metadata ?? {}),
        nom: data.nom,
        whatsapp: data.whatsapp,
        pays: data.pays,
        niveau_etudes: data.niveau_etudes,
        motivation: data.motivation ?? null,
      },
    });
    if (authError) throw new Error(authError.message);

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ nom: data.nom, email: data.email })
      .eq("id", data.agentId);
    if (profileError) throw new Error(profileError.message);

    const { error: agentError } = await supabaseAdmin
      .from("agents")
      .update({
        nom: data.nom,
        email: data.email,
        whatsapp: data.whatsapp,
        pays: data.pays,
        niveau_etudes: data.niveau_etudes,
        motivation: data.motivation ?? null,
      })
      .eq("id", data.agentId);
    if (agentError) throw new Error(agentError.message);

    return { ok: true as const };
  });

export const deleteManagedAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AgentDeleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertCanManageAgent(context, data.agentId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.agentId);
    if (error) throw new Error(error.message);

    return { ok: true as const };
  });

export const updatePlatformUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UserEditorSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existingAuth, error: existingAuthError } =
      await supabaseAdmin.auth.admin.getUserById(data.userId);
    if (existingAuthError) throw new Error(existingAuthError.message);

    const previousEmail = (existingAuth.user.email ?? "").toLowerCase();

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
      email: data.email,
      user_metadata: {
        ...(existingAuth.user.user_metadata ?? {}),
        nom: data.nom,
      },
    });
    if (authError) throw new Error(authError.message);

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .update({ nom: data.nom, email: data.email, role: data.role })
      .eq("id", data.userId);
    if (profileError) throw new Error(profileError.message);

    const { error: agentError } = await supabaseAdmin
      .from("agents")
      .update({ nom: data.nom, email: data.email })
      .eq("id", data.userId);

    if (agentError && !agentError.message.toLowerCase().includes("0 rows")) {
      throw new Error(agentError.message);
    }

    // Keep round-robin commercial matching in sync when email changes.
    if (previousEmail && previousEmail !== data.email) {
      const { error: rrError } = await supabaseAdmin
        .from("rr_state")
        .update({ email: data.email })
        .eq("email", previousEmail);
      if (rrError) throw new Error(rrError.message);
    }

    return { ok: true as const };
  });

export const deletePlatformUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UserDeleteSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    if (data.userId === context.userId) {
      throw new Error("Vous ne pouvez pas supprimer votre propre compte admin.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.userId);
    if (error) throw new Error(error.message);

    return { ok: true as const };
  });
