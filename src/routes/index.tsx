import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Award, Compass, DollarSign, Gift, ArrowRight, BookOpen } from "lucide-react";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const refCode = new URLSearchParams(window.location.search).get("ref");
    if (refCode) {
      const normalizedRefCode = refCode.trim().toUpperCase();
      localStorage.setItem("kpb_ref", normalizedRefCode);
      navigate({ to: "/rejoindre", replace: true });
    }
  }, [navigate]);

  return (
    <div className="flex flex-col bg-navy-950 text-white min-h-screen">
      {/* Hero — brand + one headline + one line + CTA + full-bleed atmosphere */}
      <section className="relative min-h-[85vh] overflow-hidden flex items-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(217,161,16,0.18),transparent_55%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23d9a110%22 fill-opacity=%220.04%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="max-w-2xl animate-fade-in-up">
            <p className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white">
              KPB <span className="text-gold-400">Education</span>
            </p>
            <h1 className="mt-6 font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-navy-100 leading-snug">
              Devenez agent et gagnez des commissions en aidant vos pairs à étudier à
              l&apos;étranger
            </h1>
            <p className="mt-5 max-w-xl text-lg text-navy-300 leading-relaxed">
              Aucun investissement. Suivi transparent. Commissions de 10 à 15&nbsp;% sur chaque
              placement.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to="/candidater"
                className="inline-flex items-center justify-center rounded-xl bg-gold-500 px-8 py-4 text-lg font-bold text-navy-950 transition-transform hover:bg-gold-400 hover:scale-[1.03] motion-reduce:hover:scale-100 group"
              >
                Postuler gratuitement
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0" />
              </Link>
              <Link
                to="/login"
                search={{ redirect: undefined }}
                className="inline-flex items-center justify-center rounded-xl border border-navy-700 bg-navy-900/60 px-8 py-4 text-lg font-semibold text-navy-200 transition-colors hover:bg-navy-900 hover:text-white"
              >
                Espace agent
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-y border-navy-900 bg-navy-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-gold-500">78K+</div>
              <div className="mt-2 text-sm font-medium text-navy-300">Abonnés TikTok</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-gold-500">70K+</div>
              <div className="mt-2 text-sm font-medium text-navy-300">Abonnés YouTube</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-gold-500">16</div>
              <div className="mt-2 text-sm font-medium text-navy-300">Pays couverts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-gold-500">10–15%</div>
              <div className="mt-2 text-sm font-medium text-navy-300">Commission agent</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-navy-950 to-navy-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Comment ça marche ?</h2>
            <p className="mt-4 text-navy-300">
              Un parcours simple pour rejoindre le réseau d&apos;agents KPB.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Tu postules",
                body: "Formulaire en 2 minutes, puis quiz de qualification.",
              },
              {
                icon: Compass,
                title: "Agent en essai",
                body: "Lien de parrainage et scripts marketing dès la réussite du quiz.",
              },
              {
                icon: Award,
                title: "1er placement",
                body: "Un étudiant inscrit et payé : tu passes Agent Certifié.",
              },
              {
                icon: DollarSign,
                title: "Tu gagnes",
                body: "Commissions 10–15 % et bonus paliers en FCFA.",
              },
            ].map((step, i) => (
              <div
                key={step.title}
                className="relative p-8 rounded-2xl border border-navy-800 bg-navy-950/60"
              >
                <span className="absolute top-4 right-6 text-5xl font-black text-navy-800/40">
                  0{i + 1}
                </span>
                <step.icon className="h-8 w-8 text-gold-500 mb-6" />
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-navy-300 text-sm">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-navy-950 border-t border-navy-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl font-bold sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gold-400">
              Nos paliers de commission
            </h2>
            <p className="mt-4 text-navy-300">
              Plus vous placez d&apos;étudiants, plus le taux augmente.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: "Bronze", rate: "10%", detail: "Moins de 3 placements" },
              { name: "Argent", rate: "12%", detail: "De 3 à 9 placements" },
              { name: "Élite", rate: "15%", detail: "10 placements et plus", highlight: true },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 border ${
                  tier.highlight
                    ? "border-gold-500/50 bg-navy-900/40"
                    : "border-navy-800 bg-navy-900/40"
                }`}
              >
                <h3 className="text-2xl font-bold text-white">{tier.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span
                    className={`text-5xl font-extrabold ${tier.highlight ? "text-gold-400" : "text-white"}`}
                  >
                    {tier.rate}
                  </span>
                  <span className="ml-1 text-sm text-navy-400">de commission</span>
                </div>
                <p className="mt-6 text-navy-300 text-sm">{tier.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-navy-900 to-navy-950 border-t border-navy-900">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-gold-400 mb-4">
            <Gift className="h-3.5 w-3.5" />
            Bonus paliers
          </div>
          <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
            Des bonus à chaque palier
          </h2>
          <p className="mt-4 text-navy-300 text-lg max-w-2xl mx-auto">
            En plus des commissions : 20&nbsp;000 / 50&nbsp;000 / 100&nbsp;000 FCFA aux paliers 3, 5
            et 10.
          </p>
          <Link
            to="/candidater"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-gold-500 px-6 py-3.5 text-base font-bold text-navy-950 hover:bg-gold-400 transition-transform hover:scale-105 motion-reduce:hover:scale-100"
          >
            Commencer à parrainer
          </Link>
        </div>
      </section>

      <footer className="border-t border-navy-900 bg-navy-950 py-12 text-center text-sm text-navy-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="font-semibold text-navy-300 mb-2">KPB Education — Programme Ambassadeur</p>
          <p className="mb-1">kpbeducation.com</p>
          <p className="mb-4">+33 7 68 67 42 92 · +33 6 99 37 40 85 · +227 96 55 64 60</p>
          <p className="mb-3">
            <Link
              to="/confidentialite"
              className="text-navy-400 underline hover:text-gold-400 transition-colors"
            >
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
  head: () => ({
    meta: [
      { title: "KPB Education — Programme Ambassadeur" },
      {
        name: "description",
        content:
          "Devenez ambassadeur KPB Education, présentez vos proches à nos conseillers et gagnez des commissions sur chaque inscription.",
      },
    ],
  }),
  component: LandingPage,
});
