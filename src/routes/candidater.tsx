import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { PAYS_LIST, NIVEAUX_ETUDES, PASSWORD_MIN_LENGTH } from "@/lib/constants";
import { generateReferralCode } from "@/lib/referral-code";
import { UserPlus, ArrowLeft, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

const candidaterSchema = z
  .object({
    nom: z.string().min(3, "Le nom doit comporter au moins 3 caractères"),
    email: z.string().email("Adresse email invalide"),
    password: z
      .string()
      .min(
        PASSWORD_MIN_LENGTH,
        `Le mot de passe doit comporter au moins ${PASSWORD_MIN_LENGTH} caractères`,
      ),
    whatsapp: z
      .string()
      .regex(
        /^\+[0-9]{8,15}$/,
        "Le numéro WhatsApp doit être au format international (ex: +22790123456)",
      ),
    pays: z.string().min(1, "Veuillez sélectionner un pays de résidence"),
    niveauEtudes: z.string().min(1, "Veuillez sélectionner votre niveau d'études"),
    dateNaissance: z.string().min(1, "La date de naissance est obligatoire"),
    motivation: z.string().max(300, "La motivation ne doit pas dépasser 300 caractères").optional(),
  })
  .superRefine((data, ctx) => {
    const dob = new Date(data.dateNaissance);
    if (Number.isNaN(dob.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Date invalide",
        path: ["dateNaissance"],
      });
      return;
    }
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 18);
    if (dob > cutoff) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Vous devez avoir au moins 18 ans pour candidater",
        path: ["dateNaissance"],
      });
    }
  });

type CandidaterFormValues = z.infer<typeof candidaterSchema>;

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : "Une erreur est survenue lors de l'inscription.";
};

const CandidaterPage: React.FC = () => {
  const navigate = useNavigate();
  const { refetchAuth } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referrerCode] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("kpb_ref"),
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidaterFormValues>({
    resolver: zodResolver(candidaterSchema),
    defaultValues: {
      motivation: "",
    },
  });

  const onSubmit = async (data: CandidaterFormValues) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // Generate the referral code up-front so it is stored with the account.
      const codeParrainage = generateReferralCode(data.pays);

      // Supabase Auth Sign Up. The matching public.agents row is created
      // server-side by the handle_new_user trigger from this metadata, which is
      // RLS-safe (works even before a session exists) and avoids orphaned rows.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nom: data.nom,
            whatsapp: data.whatsapp,
            pays: data.pays,
            niveau_etudes: data.niveauEtudes,
            date_naissance: data.dateNaissance,
            motivation: data.motivation ?? "",
            code_parrainage: codeParrainage,
            parrain_code: referrerCode ?? "",
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Impossible de créer l'utilisateur.");
      }

      // Referral code consumed.
      localStorage.removeItem("kpb_ref");

      if (!authData.session) {
        // Should not happen (auto-confirm is enabled), but try sign-in as a fallback.
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (signInError) throw new Error(signInError.message);
      }
      await refetchAuth();
      navigate({ to: "/quiz" });
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent"></div>

      {/* Return Home Link */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-navy-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>
      </div>

      <div className="mx-auto w-full max-w-4xl grid md:grid-cols-5 gap-8 bg-navy-900/40 border border-navy-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-xl relative z-10 shadow-2xl">
        {/* Info panel */}
        <div className="md:col-span-2 flex flex-col justify-between text-navy-200">
          <div>
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-400 mb-6">
              <Sparkles className="h-3 w-3" />
              <span>Ambassadeurs KPB</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">Rejoignez-nous</h2>
            <p className="mt-4 text-navy-300 text-sm leading-relaxed">
              Le Programme Agent de KPB Education vous permet de recommander vos amis et de gagner
              des commissions sur chaque dossier d'études finalisé.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
              <span>Tableau de bord de suivi en temps réel</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
              <span>15% à 30% de commissions sur le placement</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
              <span>Kit de visuels marketing pré-conçu</span>
            </div>
          </div>

          {referrerCode && (
            <div className="mt-8 p-3 rounded-xl bg-navy-950/40 border border-navy-800 text-xs text-gold-400">
              Parrainage activé : Vous postulez via le code parrain{" "}
              <span className="font-mono font-bold text-white">{referrerCode}</span>.
            </div>
          )}

          <div className="mt-8 text-xs text-navy-400">
            Une fois inscrit, vous passerez un court test de 5 questions sur notre charte de
            qualité.
          </div>
        </div>

        {/* Form Panel */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-gold-500" />
              Créer votre candidature
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                {errorMsg}
              </div>
            )}

            {/* Nom complet */}
            <div>
              <label
                htmlFor="nom"
                className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1"
              >
                Nom Complet *
              </label>
              <input
                id="nom"
                type="text"
                {...register("nom")}
                className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
                placeholder="Ex: Fatima Diallo"
              />
              {errors.nom && <p className="mt-1 text-xs text-rose-400">{errors.nom.message}</p>}
            </div>

            {/* Email & Mot de passe */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1"
                >
                  Email *
                </label>
                <input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
                  placeholder="nom@exemple.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1"
                >
                  Mot de passe *
                </label>
                <input
                  id="password"
                  type="password"
                  {...register("password")}
                  className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label
                htmlFor="whatsapp"
                className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1"
              >
                Numéro WhatsApp *
              </label>
              <input
                id="whatsapp"
                type="text"
                {...register("whatsapp")}
                className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
                placeholder="Ex: +22790123456"
              />
              {errors.whatsapp && (
                <p className="mt-1 text-xs text-rose-400">{errors.whatsapp.message}</p>
              )}
            </div>

            {/* Pays & Niveau d'études */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="pays"
                  className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1"
                >
                  Pays de résidence *
                </label>
                <select
                  id="pays"
                  {...register("pays")}
                  className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm appearance-none"
                >
                  <option value="" className="bg-navy-950 text-navy-500">
                    Choisir un pays...
                  </option>
                  {PAYS_LIST.map((p) => (
                    <option key={p} value={p} className="bg-navy-950 text-white">
                      {p}
                    </option>
                  ))}
                </select>
                {errors.pays && <p className="mt-1 text-xs text-rose-400">{errors.pays.message}</p>}
              </div>

              <div>
                <label
                  htmlFor="niveauEtudes"
                  className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1"
                >
                  Niveau d'études actuel *
                </label>
                <select
                  id="niveauEtudes"
                  {...register("niveauEtudes")}
                  className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm appearance-none"
                >
                  <option value="" className="bg-navy-950 text-navy-500">
                    Choisir un niveau...
                  </option>
                  {NIVEAUX_ETUDES.map((n) => (
                    <option key={n} value={n} className="bg-navy-950 text-white">
                      {n}
                    </option>
                  ))}
                </select>
                {errors.niveauEtudes && (
                  <p className="mt-1 text-xs text-rose-400">{errors.niveauEtudes.message}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="dateNaissance"
                className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1"
              >
                Date de naissance *
              </label>
              <input
                id="dateNaissance"
                type="date"
                aria-invalid={Boolean(errors.dateNaissance)}
                {...register("dateNaissance")}
                className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
              />
              {errors.dateNaissance && (
                <p role="alert" className="mt-1 text-xs text-rose-400">
                  {errors.dateNaissance.message}
                </p>
              )}
              <p className="mt-1 text-[11px] text-navy-500">
                Réservé aux personnes majeures (18 ans minimum).
              </p>
            </div>

            {/* Motivation */}
            <div>
              <label
                htmlFor="motivation"
                className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1"
              >
                Motivation (facultatif - 300 chars max)
              </label>
              <textarea
                id="motivation"
                rows={3}
                {...register("motivation")}
                maxLength={300}
                className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
                placeholder="Pourquoi souhaitez-vous devenir agent KPB ?"
              />
              {errors.motivation && (
                <p className="mt-1 text-xs text-rose-400">{errors.motivation.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center rounded-xl bg-gold-500 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-all hover:scale-[1.01] shadow-[0_0_20px_rgba(217,161,16,0.2)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Création du compte...
                  </>
                ) : (
                  "Soumettre ma candidature & Passer le Quiz"
                )}
              </button>
            </div>

            <div className="text-center text-xs text-navy-400 mt-4">
              Vous avez déjà un compte ?{" "}
              <Link
                to="/login"
                search={{ redirect: undefined }}
                className="text-gold-400 hover:text-gold-300 font-semibold underline"
              >
                Connectez-vous ici
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export const Route = createFileRoute("/candidater")({
  component: CandidaterPage,
});
