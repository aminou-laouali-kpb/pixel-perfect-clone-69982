import { createFileRoute } from "@tanstack/react-router";
import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { DESTINATIONS } from '@/lib/utils';
import { GraduationCap, ArrowLeft, Loader2, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

const rejoindreSchema = z.object({
  nom: z.string().min(3, 'Indiquez votre nom complet (au moins 3 caractères)'),
  whatsapp: z
    .string()
    .regex(/^\+[0-9]{8,15}$/, 'Numéro WhatsApp au format international (ex: +22790123456)'),
  email: z.string().email('Adresse email invalide').optional().or(z.literal('')),
  pays: z.string().min(1, 'Sélectionnez votre pays'),
  destination: z.string().min(1, 'Sélectionnez une destination'),
  message: z.string().max(400, 'Message trop long (400 caractères max)').optional(),
  consent: z.boolean().refine((v) => v === true, {
    message: 'Vous devez accepter d\'être recontacté pour continuer.',
  }),
  // Honeypot anti-bot : invisible pour les humains, rempli par les robots.
  website: z.string().optional(),
});

type RejoindreFormValues = z.infer<typeof rejoindreSchema>;

const PAYS_LIST = [
  "Niger", "Côte d'Ivoire", "Sénégal", "Cameroun", "Maroc", "Mali",
  "Burkina Faso", "Guinée", "Togo", "Bénin", "Congo", "RDC",
  "Madagascar", "Mauritanie", "Autre",
];

const DESTINATION_OPTIONS = [...DESTINATIONS, 'Autre'];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message.includes('Code de parrainage')) {
      return "Ce lien de parrainage n'est pas valide. Demandez un nouveau lien à votre ambassadeur.";
    }
    return error.message;
  }
  return "Une erreur est survenue lors de l'envoi de votre demande.";
};

const RejoindrePage: React.FC = () => {
  const code = typeof window === 'undefined'
    ? ''
    : (new URLSearchParams(window.location.search).get('ref')
        || localStorage.getItem('kpb_ref')
        || '');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RejoindreFormValues>({
    resolver: zodResolver(rejoindreSchema),
    defaultValues: { message: '', consent: false },
  });

  const onSubmit = async (data: RejoindreFormValues) => {
    // Honeypot rempli => robot : on simule un succès sans rien créer.
    if (data.website && data.website.trim() !== '') {
      setSubmitted(true);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.rpc('submit_referral_lead', {
        p_code: code,
        p_nom: data.nom,
        p_whatsapp: data.whatsapp,
        p_email: data.email || null,
        p_pays: data.pays,
        p_destination: data.destination,
        p_notes: data.message || null,
      });

      if (error) throw new Error(error.message);

      localStorage.removeItem('kpb_ref');
      setSubmitted(true);
    } catch (err: unknown) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Missing/invalid referral code: cannot attribute the lead to an agent.
  if (!code) {
    return (
      <div className="flex-1 bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md bg-navy-900/40 border border-navy-800/80 rounded-3xl p-8 backdrop-blur-xl text-center shadow-2xl space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20">
            <ShieldCheck className="h-7 w-7 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Lien de parrainage manquant</h2>
          <p className="text-navy-300 text-sm leading-relaxed">
            Cette page doit être ouverte via le lien personnel d'un ambassadeur KPB.
            Demandez-lui de vous renvoyer son lien d'invitation.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-gold-500 px-6 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-all"
          >
            Découvrir KPB Education
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex-1 bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md bg-navy-900/40 border border-navy-800/80 rounded-3xl p-8 backdrop-blur-xl text-center shadow-2xl space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="h-9 w-9 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Demande envoyée ! 🎉</h2>
          <p className="text-navy-300 text-sm leading-relaxed">
            Merci ! Un conseiller KPB Education vous contactera très bientôt sur WhatsApp
            pour étudier votre projet d'études à l'étranger. Pensez à garder votre téléphone à portée.
          </p>
          <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800 text-xs text-navy-300 text-left space-y-1">
            <p className="font-bold text-gold-400 uppercase tracking-wider">En attendant</p>
            <p>Préparez vos relevés de notes et diplômes — ils accéléreront l'étude de votre dossier.</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-navy-700 bg-navy-900/60 px-6 py-3 text-sm font-semibold text-navy-200 hover:bg-navy-900 hover:text-white transition-all"
          >
            En savoir plus sur KPB
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-500/5 via-transparent to-transparent"></div>

      <div className="absolute top-4 left-4 sm:top-8 sm:left-8">
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-navy-400 hover:text-white transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Accueil
        </Link>
      </div>

      <div className="mx-auto w-full max-w-4xl grid md:grid-cols-5 gap-8 bg-navy-900/40 border border-navy-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-xl relative z-10 shadow-2xl">
        {/* Info panel */}
        <div className="md:col-span-2 flex flex-col justify-between text-navy-200">
          <div>
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-400 mb-6">
              <Sparkles className="h-3 w-3" />
              <span>Études à l'étranger</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">Lancez votre projet</h2>
            <p className="mt-4 text-navy-300 text-sm leading-relaxed">
              Vous avez été invité par un ambassadeur KPB. Laissez vos coordonnées : un conseiller
              vous accompagne gratuitement dans le choix d'école, l'admission et le visa.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
              <span>Accompagnement de bout en bout</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
              <span>Acompte remboursé à 100% en cas de refus de visa</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="h-5 w-5 text-gold-500 shrink-0 mt-0.5" />
              <span>France, Maroc, Turquie, Canada, Dubaï, USA</span>
            </div>
          </div>

          <div className="mt-8 p-3 rounded-xl bg-navy-950/40 border border-navy-800 text-xs text-gold-400">
            Invitation via le code <span className="font-mono font-bold text-white">{code}</span>
          </div>
        </div>

        {/* Form panel */}
        <div className="md:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Honeypot anti-bot : hors écran, non focusable, jamais rempli par un humain. */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" tabIndex={-1}>
              <label>
                Ne pas remplir
                <input type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
              </label>
            </div>

            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-gold-500" />
              Être recontacté gratuitement
            </h3>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="nom" className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
                Nom complet *
              </label>
              <input
                id="nom"
                type="text"
                {...register('nom')}
                className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
                placeholder="Ex: Fatima Diallo"
              />
              {errors.nom && <p className="mt-1 text-xs text-rose-400">{errors.nom.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="whatsapp" className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
                  WhatsApp *
                </label>
                <input
                  id="whatsapp"
                  type="text"
                  {...register('whatsapp')}
                  className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
                  placeholder="+22790123456"
                />
                {errors.whatsapp && <p className="mt-1 text-xs text-rose-400">{errors.whatsapp.message}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
                  Email (facultatif)
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
                  placeholder="nom@exemple.com"
                />
                {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="pays" className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
                  Pays de résidence *
                </label>
                <select
                  id="pays"
                  {...register('pays')}
                  className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm appearance-none"
                >
                  <option value="" className="bg-navy-950 text-navy-500">Choisir...</option>
                  {PAYS_LIST.map(p => (
                    <option key={p} value={p} className="bg-navy-950 text-white">{p}</option>
                  ))}
                </select>
                {errors.pays && <p className="mt-1 text-xs text-rose-400">{errors.pays.message}</p>}
              </div>

              <div>
                <label htmlFor="destination" className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
                  Destination souhaitée *
                </label>
                <select
                  id="destination"
                  {...register('destination')}
                  className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm appearance-none"
                >
                  <option value="" className="bg-navy-950 text-navy-500">Choisir...</option>
                  {DESTINATION_OPTIONS.map(d => (
                    <option key={d} value={d} className="bg-navy-950 text-white">{d}</option>
                  ))}
                </select>
                {errors.destination && <p className="mt-1 text-xs text-rose-400">{errors.destination.message}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-xs font-semibold text-navy-300 uppercase tracking-wider mb-1">
                Votre projet (facultatif)
              </label>
              <textarea
                id="message"
                rows={3}
                {...register('message')}
                maxLength={400}
                className="w-full rounded-xl bg-navy-950/50 border border-navy-800 px-4 py-2 text-white placeholder-navy-500 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all text-sm"
                placeholder="Niveau d'études, filière visée, échéance..."
              />
              {errors.message && <p className="mt-1 text-xs text-rose-400">{errors.message.message}</p>}
            </div>

            <div>
              <label className="flex items-start gap-2.5 text-xs text-navy-300 leading-relaxed cursor-pointer">
                <input
                  type="checkbox"
                  {...register('consent')}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-navy-700 bg-navy-950 text-gold-500 focus:ring-gold-500/40"
                />
                <span>
                  J'accepte d'être recontacté par un conseiller KPB Education au sujet de mon projet
                  d'études, et que mes informations soient utilisées à cette fin.
                </span>
              </label>
              {errors.consent && <p className="mt-1 text-xs text-rose-400">{errors.consent.message}</p>}
              <p className="mt-1.5 text-[11px] text-navy-500">
                En savoir plus :{' '}
                <Link to="/confidentialite" className="text-navy-400 underline hover:text-navy-200">
                  politique de confidentialité
                </Link>
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center rounded-xl bg-gold-500 py-3 text-sm font-bold text-navy-950 hover:bg-gold-400 transition-all hover:scale-[1.01] shadow-[0_0_20px_rgba(217,161,16,0.2)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Envoi en cours...
                  </>
                ) : (
                  'Être recontacté par un conseiller'
                )}
              </button>
            </div>

            <p className="text-center text-xs text-navy-500 mt-3">
              Vos informations sont transmises uniquement à un conseiller KPB Education.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
export const Route = createFileRoute("/rejoindre")({
  component: RejoindrePage,
});
