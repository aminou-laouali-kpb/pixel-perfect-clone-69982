import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import { KeyRound, Loader2 } from 'lucide-react';

const schema = z
  .object({
    password: z.string().min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
    confirm: z.string(),
  })
  .refine(data => data.password === data.confirm, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw new Error(error.message);

      // The recovery session is single-purpose: sign out so the user logs in fresh.
      await supabase.auth.signOut();
      showToast('Mot de passe mis à jour. Connectez-vous.', 'success');
      navigate({ to: '/login',, { replace: true }});
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue.";
      setErrorMsg(
        message.toLowerCase().includes('session')
          ? "Lien invalide ou expiré. Refaites une demande de réinitialisation."
          : message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent"></div>

      <div className="mx-auto w-full max-w-md bg-navy-900/40 border border-navy-800/80 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <KeyRound className="h-6 w-6 text-gold-500" />
            Nouveau mot de passe
          </h2>
          <p className="mt-2 text-sm text-navy-300">
            Choisissez un nouveau mot de passe pour votre compte.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
              Nouveau mot de passe
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2.5 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirm" className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              type="password"
              {...register('confirm')}
              className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2.5 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
              placeholder="••••••••"
            />
            {errors.confirm && <p className="mt-1 text-xs text-rose-400">{errors.confirm.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center rounded-xl bg-gold-500 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-all hover:scale-[1.01] shadow-[0_0_20px_rgba(217,161,16,0.2)] disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Mise à jour...
              </>
            ) : (
              'Mettre à jour le mot de passe'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
export const Route = createFileRoute("/reinitialiser-mot-de-passe")({
  component: ResetPasswordPage,
});
