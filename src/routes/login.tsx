import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { LogIn, KeyRound, Mail, Loader2, ArrowLeft } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refetchAuth } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get destination route from navigation state if available
  const from = location.state?.from?.pathname || null;

  const getErrorMessage = (error: unknown) => {
    return error instanceof Error ? error.message : "Une erreur est survenue lors de la connexion.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Refresh Auth Context to fetch the profile role
      await refetchAuth();

      // Fetch user role directly to determine routing destination
      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      if (profileData) {
        // Redirect according to user role
        if (from) {
          navigate({ to: from, replace: true });
        } else if (profileData.role === 'commercial') {
          navigate({ to: '/commercial', replace: true });
        } else if (profileData.role === 'admin') {
          navigate({ to: '/admin', replace: true });
        } else {
          navigate({ to: '/dashboard', replace: true });
        }
      } else {
        navigate({ to: '/dashboard', replace: true });
      }
    } catch (err: unknown) {
      console.error('Login error:', err);
      const message = getErrorMessage(err);
      setErrorMsg(message === "Invalid login credentials" 
        ? "Identifiants invalides. Veuillez vérifier votre adresse email et votre mot de passe." 
        : message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent"></div>
      
      {/* Return Home Link */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-navy-400 hover:text-white transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>
      </div>

      <div className="mx-auto w-full max-w-md bg-navy-900/40 border border-navy-800/80 rounded-3xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6 text-gold-500" />
            Accéder à l'Espace KPB
          </h2>
          <p className="mt-2 text-sm text-navy-300">
            Connectez-vous pour accéder à votre tableau de bord
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
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
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl bg-navy-950/50 border border-navy-800 pl-10 pr-4 py-2.5 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
                placeholder="nom@exemple.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-navy-500">
                <KeyRound className="h-4 w-4" />
              </span>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl bg-navy-950/50 border border-navy-800 pl-10 pr-4 py-2.5 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
                placeholder="••••••••"
              />
            </div>
            <div className="mt-2 text-right">
              <Link to="/mot-de-passe-oublie" className="text-xs font-semibold text-navy-400 hover:text-gold-400 transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center rounded-xl bg-gold-500 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-all hover:scale-[1.01] shadow-[0_0_20px_rgba(217,161,16,0.2)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-xs text-navy-400">
          Pas encore agent ?{" "}
          <Link to="/candidater" className="text-gold-400 hover:text-gold-300 font-semibold underline">
            Candidater ici
          </Link>
        </div>
      </div>
    </div>
  );
};
export const Route = createFileRoute("/login")({
  component: LoginPage,
});
