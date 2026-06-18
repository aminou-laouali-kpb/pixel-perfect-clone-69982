import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Award, Compass, DollarSign, Gift, ArrowRight, ShieldCheck, BookOpen } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const refCode = new URLSearchParams(window.location.search).get('ref');
    if (refCode) {
      const normalizedRefCode = refCode.trim().toUpperCase();
      localStorage.setItem('kpb_ref', normalizedRefCode);
      navigate({ to: '/rejoindre', replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex flex-col bg-navy-950 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-36 bg-gradient-to-b from-navy-950 via-navy-900 to-navy-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold-500/10 via-transparent to-transparent"></div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-12">
            <div className="flex-1 text-center lg:text-left">
              {/* Urgency Badge */}
              <div className="inline-flex items-center space-x-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-sm font-medium text-gold-400 mb-6 animate-pulse-gold">
                <span className="h-2 w-2 rounded-full bg-gold-500"></span>
                <span>Rentrée Septembre 2026 — Période en cours : 10 Juin – 10 Octobre 2026</span>
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-white via-navy-100 to-gold-300">
                Devenez Agent KPB
              </h1>
              <p className="mt-4 text-2xl font-bold text-gold-400 leading-tight">
                Gagnez des commissions réelles en aidant vos pairs à étudier à l'étranger
              </p>
              <p className="mx-auto lg:mx-0 mt-6 max-w-2xl text-lg text-navy-300 leading-relaxed">
                Rejoignez le réseau d'agents officiels KPB. Aucun investissement requis. Résultats 100% transparents et traçables sur votre tableau de bord.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/candidater"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-gold-500 px-8 py-4 text-lg font-bold text-navy-950 transition-all hover:bg-gold-400 hover:scale-[1.03] shadow-[0_0_30px_rgba(217,161,16,0.3)] group"
                >
                  Postuler maintenant — Gratuit
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-navy-700 bg-navy-900/60 px-8 py-4 text-lg font-semibold text-navy-200 transition-all hover:bg-navy-900 hover:text-white"
                >
                  Espace agent existant
                </Link>
              </div>
            </div>

            {/* Visual element (Decorative Card mockup) */}
            <div className="flex-1 mt-16 lg:mt-0 flex justify-center">
              <div className="relative w-full max-w-md p-8 rounded-3xl border border-navy-800 bg-navy-900/50 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-gold-500/10 blur-2xl"></div>
                <h3 className="text-xl font-bold text-gold-400 mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-gold-500" />
                  Simulation de Gains
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800">
                    <div className="text-xs text-navy-400 uppercase tracking-wider">Commission par placement</div>
                    <div className="text-xl font-semibold text-white flex justify-between items-center mt-1">
                      <span>1 Étudiant inscrit</span>
                      <span className="text-gold-400">10 % à 15 %</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-800">
                    <div className="text-xs text-navy-400 uppercase tracking-wider">Bonus palier (10 parrainages)</div>
                    <div className="text-xl font-semibold text-white flex justify-between items-center mt-1">
                      <span>Récompense</span>
                      <span className="text-gold-400">+100 000 FCFA</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-navy-800 flex justify-between items-center text-sm">
                    <span className="text-navy-300">Paliers bonus</span>
                    <span className="text-emerald-400 font-bold">3 · 5 · 10 parrainages</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-navy-900 bg-navy-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl bg-navy-900/30 border border-navy-800/50">
              <div className="text-4xl font-extrabold text-gold-500">78K+</div>
              <div className="mt-2 text-sm font-medium text-navy-300">Abonnés TikTok</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-navy-900/30 border border-navy-800/50">
              <div className="text-4xl font-extrabold text-gold-500">70K+</div>
              <div className="mt-2 text-sm font-medium text-navy-300">Abonnés YouTube</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-navy-900/30 border border-navy-800/50">
              <div className="text-4xl font-extrabold text-gold-500">16</div>
              <div className="mt-2 text-sm font-medium text-navy-300">Pays couverts</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-navy-900/30 border border-navy-800/50">
              <div className="text-4xl font-extrabold text-gold-500">10–15%</div>
              <div className="mt-2 text-sm font-medium text-navy-300">Commission agent</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section className="py-20 bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">Comment ça marche ?</h2>
            <p className="mt-4 text-navy-300">Un parcours simple pour devenir un agent de placement reconnu par KPB Education.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative p-8 rounded-2xl border border-navy-800 bg-navy-950/60 flex flex-col justify-between">
              <span className="absolute top-4 right-6 text-5xl font-black text-navy-800/40">01</span>
              <div>
                <BookOpen className="h-8 w-8 text-gold-500 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Tu postules</h3>
                <p className="text-navy-300 text-sm">Remplis le formulaire en 2 minutes et passe le test de qualification de 5 questions.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative p-8 rounded-2xl border border-navy-800 bg-navy-950/60 flex flex-col justify-between">
              <span className="absolute top-4 right-6 text-5xl font-black text-navy-800/40">02</span>
              <div>
                <Compass className="h-8 w-8 text-gold-500 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Agent en essai</h3>
                <p className="text-navy-300 text-sm">Obtiens ton lien de parrainage et ton kit marketing dès que tu passes le test.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative p-8 rounded-2xl border border-navy-800 bg-navy-950/60 flex flex-col justify-between">
              <span className="absolute top-4 right-6 text-5xl font-black text-navy-800/40">03</span>
              <div>
                <Award className="h-8 w-8 text-gold-500 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">1er placement</h3>
                <p className="text-navy-300 text-sm">Parraine ton premier étudiant qui règle ses frais de scolarité pour devenir Agent Certifié.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative p-8 rounded-2xl border border-navy-800 bg-navy-950/60 flex flex-col justify-between">
              <span className="absolute top-4 right-6 text-5xl font-black text-navy-800/40">04</span>
              <div>
                <DollarSign className="h-8 w-8 text-gold-500 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">Tu gagnes</h3>
                <p className="text-navy-300 text-sm">Reçois 10 à 15% de commission par placement scolaire, et progresse dans les tiers d'agents.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers / Niveaux Section */}
      <section className="py-20 bg-navy-950 border-t border-navy-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gold-400">
              Nos Paliers de Récompense
            </h2>
            <p className="mt-4 text-navy-300">
              Plus vous aidez d'étudiants, plus vos pourcentages de commissions augmentent.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Bronze */}
            <div className="rounded-2xl border border-navy-800 bg-navy-900/40 p-8 flex flex-col justify-between relative">
              <div>
                <div className="text-sm font-semibold text-orange-400 uppercase tracking-widest mb-1">Palier Initial</div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  Bronze 🥉
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-white">10%</span>
                  <span className="ml-1 text-sm text-navy-400">de commission</span>
                </div>
                <ul className="mt-6 space-y-3 text-navy-300 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                    Moins de 3 parrainages réussis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                    Accès au Kit Marketing Standard
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                    Éligible aux bonus paliers
                  </li>
                </ul>
              </div>
            </div>

            {/* Argent */}
            <div className="rounded-2xl border-2 border-navy-700 bg-navy-900/60 p-8 flex flex-col justify-between relative shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full bg-navy-800 border border-navy-700 px-4 py-1 text-xs font-semibold text-gold-400">
                Populaire ⭐
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-1">Palier Intermédiaire</div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  Argent 🥈
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-white">12%</span>
                  <span className="ml-1 text-sm text-navy-400">de commission</span>
                </div>
                <ul className="mt-6 space-y-3 text-navy-300 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                    De 3 à 9 parrainages réussis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                    Support direct prioritaire
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                    Accès aux scripts WhatsApp avancés
                  </li>
                </ul>
              </div>
            </div>

            {/* Elite */}
            <div className="rounded-2xl border border-gold-500/50 bg-navy-900/40 p-8 flex flex-col justify-between relative shadow-[0_15px_35px_rgba(217,161,16,0.1)]">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-500 px-4 py-1 text-xs font-bold text-navy-950">
                Partenaire Élite
              </div>
              <div>
                <div className="text-sm font-semibold text-gold-400 uppercase tracking-widest mb-1">Palier Supérieur</div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  Élite 🥇
                </h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-gold-400">15%</span>
                  <span className="ml-1 text-sm text-navy-400">de commission</span>
                </div>
                <ul className="mt-6 space-y-3 text-navy-300 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                    10+ parrainages réussis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                    Accès anticipé aux nouvelles écoles
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
                    Invitations aux séminaires KPB
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bonus paliers Section */}
      <section className="py-20 bg-gradient-to-b from-navy-900 to-navy-950 border-t border-navy-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-navy-800 bg-navy-900/60 p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-gold-500/5 blur-3xl"></div>

            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <div className="inline-flex items-center space-x-1 rounded-full bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-400 mb-4">
                <Gift className="h-3.5 w-3.5" />
                <span>Bonus paliers</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Des bonus à chaque palier
              </h2>
              <p className="mt-4 text-navy-300 text-lg">
                En plus de tes commissions, débloque un bonus en argent à chaque cap de parrainages réussis.
              </p>
            </div>

            <div className="relative z-10 mt-8 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="rounded-2xl border border-navy-800 bg-navy-950/60 p-5 text-center">
                <div className="text-sm text-navy-400">3 parrainages</div>
                <div className="text-2xl font-extrabold text-gold-400 mt-1">20 000 FCFA</div>
              </div>
              <div className="rounded-2xl border border-navy-800 bg-navy-950/60 p-5 text-center">
                <div className="text-sm text-navy-400">5 parrainages</div>
                <div className="text-2xl font-extrabold text-gold-400 mt-1">50 000 FCFA</div>
              </div>
              <div className="rounded-2xl border border-navy-800 bg-navy-950/60 p-5 text-center">
                <div className="text-sm text-navy-400">10 parrainages</div>
                <div className="text-2xl font-extrabold text-gold-400 mt-1">100 000 FCFA</div>
              </div>
            </div>

            <div className="relative z-10 mt-8 text-center">
              <Link
                to="/candidater"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-base font-bold text-navy-950 hover:bg-slate-100 transition-all shadow-lg hover:scale-105"
              >
                Commencer à parrainer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Challenge tableau d'honneur */}
      <section className="py-20 bg-navy-950 border-t border-navy-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-400 mb-4">
              <Award className="h-3.5 w-3.5" />
              <span>Challenge de la rentrée</span>
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl text-white">Montez sur le podium 🏆</h2>
            <p className="mt-4 text-navy-300">
              À chaque période d'inscription, les meilleurs ambassadeurs sont récompensés.
              Période en cours : <strong className="text-gold-400">10 juin → 10 octobre 2026</strong>.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-gold-500/40 bg-navy-900/50 p-6 text-center">
              <div className="text-4xl">🥇</div>
              <div className="mt-2 text-sm font-bold text-white">1ᵉʳ parrain</div>
              <div className="text-sm text-gold-400 mt-1">Smartphone ou tablette</div>
            </div>
            <div className="rounded-2xl border border-navy-700 bg-navy-900/50 p-6 text-center">
              <div className="text-4xl">🥈</div>
              <div className="mt-2 text-sm font-bold text-white">2ᵉ parrain</div>
              <div className="text-sm text-navy-300 mt-1">Accessoire électronique</div>
            </div>
            <div className="rounded-2xl border border-navy-800 bg-navy-900/50 p-6 text-center">
              <div className="text-4xl">🥉</div>
              <div className="mt-2 text-sm font-bold text-white">3ᵉ parrain</div>
              <div className="text-sm text-navy-300 mt-1">Gadget</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-900 bg-navy-950 py-12 text-center text-sm text-navy-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-semibold text-navy-300 mb-2">KPB Education — Programme Agent KPB</p>
          <p className="mb-1">kpbeducation.com</p>
          <p className="mb-4">+33 7 68 67 42 92 · +33 6 99 37 40 85 · +227 96 55 64 60</p>
          <p className="mb-3">
            <Link to="/confidentialite" className="text-navy-400 underline hover:text-gold-400 transition-colors">
              Politique de confidentialité
            </Link>
          </p>
          <p className="text-navy-500 text-xs">© 2026 KPB Education. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
};
export const Route = createFileRoute("/")({
  component: LandingPage,
});
