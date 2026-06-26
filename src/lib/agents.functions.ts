import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

const InviteAgentSchema = z.object({
  nom: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  whatsapp: z.string().trim().min(5).max(40),
  pays: z.string().trim().min(2).max(80),
  niveau_etudes: z.string().trim().min(1).max(80),
  motivation: z.string().trim().max(1000).optional().nullable(),
  redirectTo: z.string().url().optional(),
});

function generateCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) {
    s += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return s;
}

export const inviteAgent = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InviteAgentSchema.parse(input))
  .handler(async ({ data, context }) => {
    // 1. Verify caller is commercial or admin
    const { data: roleRow, error: roleErr } = await context.supabase
      .from('profiles')
      .select('role')
      .eq('id', context.userId)
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    const role = roleRow?.role;
    if (role !== 'commercial' && role !== 'admin') {
      throw new Error('Action réservée aux commerciaux et administrateurs.');
    }

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

    // 2. Generate a unique code_parrainage (retry on collision)
    let code = '';
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = generateCode();
      const { data: existing } = await supabaseAdmin
        .from('agents')
        .select('id')
        .eq('code_parrainage', candidate)
        .maybeSingle();
      if (!existing) {
        code = candidate;
        break;
      }
    }
    if (!code) throw new Error("Impossible de générer un code de parrainage unique. Réessayez.");

    // 3. Send Supabase invite email — handle_new_user trigger will create profile + agent row
    const { data: invited, error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      data.email,
      {
        data: {
          nom: data.nom,
          whatsapp: data.whatsapp,
          pays: data.pays,
          niveau_etudes: data.niveau_etudes,
          motivation: data.motivation ?? null,
          code_parrainage: code,
        },
        redirectTo: data.redirectTo,
      },
    );

    if (inviteErr) {
      const msg = inviteErr.message || 'Erreur lors de l\u2019invitation.';
      if (/already/i.test(msg) || /registered/i.test(msg) || /exists/i.test(msg)) {
        throw new Error('Cet email est déjà enregistré.');
      }
      throw new Error(msg);
    }

    return {
      ok: true as const,
      code_parrainage: code,
      user_id: invited?.user?.id ?? null,
      email: data.email,
    };
  });