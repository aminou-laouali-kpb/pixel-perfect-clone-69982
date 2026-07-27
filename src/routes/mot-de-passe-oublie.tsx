import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
import { Mail, Loader2, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
      });
      if (error) throw new Error(error.message);
      setSent(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent"></div>

      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link
          to="/login"
          className="inline-flex items-center text-sm font-semibold text-navy-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la connexion
        </Link>
      </div>

      <div className="mx-auto w-full max-w-md bg-navy-900/40 border border-navy-800/80 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
        {sent ? (
          <div className="text-center space-y-5">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="h-9 w-9 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Email envoyé</h2>
            <p className="text-sm text-navy-300 leading-relaxed">
              Si un compte existe pour <span className="font-semibold text-white">{email}</span>,
              vous recevrez un lien pour réinitialiser votre mot de passe. Pensez à vérifier vos
              spams.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-all"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
                <KeyRound className="h-6 w-6 text-gold-500" />
                Mot de passe oublié
              </h2>
              <p className="mt-2 text-sm text-navy-300">
                Entrez votre email, nous vous enverrons un lien de réinitialisation.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1"
                >
                  Adresse email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-navy-500">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-navy-950/50 border border-navy-800 pl-10 pr-4 py-2.5 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
                    placeholder="nom@exemple.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center rounded-xl bg-gold-500 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-all hover:scale-[1.01] shadow-[0_0_20px_rgba(217,161,16,0.2)] disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien"
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
export const Route = createFileRoute("/mot-de-passe-oublie")({
  component: ForgotPasswordPage,
});
