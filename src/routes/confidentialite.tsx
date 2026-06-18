import { createFileRoute } from "@tanstack/react-router";
import React from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

const ConfidentialitePage: React.FC = () => {
  return (
    <div className="flex-1 bg-navy-950 py-12 px-4 sm:px-6 lg:px-8 text-navy-200">
      <div className="mx-auto w-full max-w-3xl">
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-navy-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="rounded-3xl border border-navy-800/80 bg-navy-900/40 p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gold-500/10 p-2.5 border border-gold-500/20 text-gold-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Politique de confidentialité</h1>
              <p className="text-xs text-navy-400 mt-1">KPB Education — Programme Ambassadeur</p>
            </div>
          </div>

          <section className="space-y-3 text-sm leading-relaxed">
            <p>
              KPB Education attache de l'importance à la protection de vos données personnelles.
              Cette page explique quelles informations nous collectons, pourquoi, et quels sont vos droits.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">1. Données que nous collectons</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li><strong className="text-white">Prospects étudiants</strong> : nom, numéro WhatsApp, adresse email (facultatif), pays de résidence, destination souhaitée et, le cas échéant, le descriptif de votre projet.</li>
              <li><strong className="text-white">Ambassadeurs</strong> : nom, email, numéro WhatsApp, pays, niveau d'études et motivation.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">2. Finalités</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Vous recontacter au sujet de votre projet d'études à l'étranger.</li>
              <li>Assurer le suivi des candidatures et l'accompagnement (école, admission, visa).</li>
              <li>Gérer le programme d'ambassadeurs et le calcul des commissions.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">3. Qui a accès à vos données</h2>
            <p className="text-sm">
              Vos informations sont accessibles uniquement aux conseillers et au personnel autorisé de
              KPB Education, dans le cadre strict de votre accompagnement. Elles ne sont ni vendues, ni
              louées à des tiers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">4. Durée de conservation</h2>
            <p className="text-sm">
              Vos données sont conservées le temps nécessaire au traitement de votre demande et à la
              relation avec KPB Education, puis supprimées ou anonymisées.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">5. Vos droits</h2>
            <p className="text-sm">
              Vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition concernant
              vos données. Pour exercer ces droits, contactez-nous (voir ci-dessous).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-white">6. Contact</h2>
            <p className="text-sm">
              KPB Education — <a href="mailto:contact@kpbeducation.com" className="text-gold-400 hover:text-gold-300 underline">contact@kpbeducation.com</a> · +33 7 68 67 42 92 · +33 6 99 37 40 85 · +227 96 55 64 60
            </p>
          </section>

          <p className="text-xs text-navy-500 border-t border-navy-800 pt-6">
            Ce document est un modèle fourni à titre indicatif et doit être revu et adapté par KPB Education
            (et le cas échéant un conseil juridique) avant exploitation en production.
          </p>
        </div>
      </div>
    </div>
  );
};
export const Route = createFileRoute("/confidentialite")({
  component: ConfidentialitePage,
});
