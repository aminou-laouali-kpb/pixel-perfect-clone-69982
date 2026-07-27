import React, { useState } from "react";
import { Copy, Check, AlertTriangle, MessageSquare, FileText } from "lucide-react";

interface MarketingKitProps {
  agentCode: string;
}

export const MarketingKit: React.FC<MarketingKitProps> = ({ agentCode }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const referralLink =
    typeof window === "undefined"
      ? `/rejoindre?ref=${encodeURIComponent(agentCode)}`
      : `${window.location.origin}/rejoindre?ref=${encodeURIComponent(agentCode)}`;

  const WHATSAPP_SCRIPTS = [
    {
      title: "Option 1 : Message direct à un ami",
      content: `Salut ! J'ai vu que tu cherchais à étudier à l'étranger (France, Canada, Maroc...). Je te conseille de passer par KPB Education, ils t'accompagnent de bout en bout (choix d'école, admission, visa) et en cas de refus visa, l'acompte de l'école est remboursé à 100%. Tu peux t'inscrire via mon lien de recommandation ici : ${referralLink}`,
    },
    {
      title: "Option 2 : Partage dans un groupe d'étudiants",
      content: `Hello tout le monde ! Pour ceux qui préparent leur projet d'études à l'étranger (Rentrée 2026), KPB Education a ouvert sa phase de pré-inscription pour la France, le Canada, la Turquie et le Maroc. L'accompagnement est complet et sécurisé. Inscrivez-vous gratuitement via ce lien pour être contacté par un conseiller : ${referralLink}`,
    },
    {
      title: "Option 3 : Message d'information sur les garanties",
      content: `Besoin d'un accompagnement fiable pour tes études à l'étranger ? KPB Education propose des admissions garanties dans leurs écoles partenaires et un remboursement à 100% de ton acompte en cas de refus de ton visa. C'est l'agence la plus transparente. Inscris-toi ici pour en discuter avec eux : ${referralLink}`,
    },
  ];

  const handleCopyScript = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-navy-850 bg-navy-900/40 flex items-start gap-4">
          <div className="rounded-xl bg-gold-500/10 p-2.5 text-gold-500 shrink-0 border border-gold-500/15">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">Scripts WhatsApp</h4>
            <p className="text-xs text-navy-400 mt-1">3 modèles de messages</p>
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 mt-3 border border-emerald-500/20">
              Disponible
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-navy-850 bg-navy-900/40 flex items-start gap-4 opacity-70">
          <div className="rounded-xl bg-navy-800 p-2.5 text-navy-500 shrink-0 border border-navy-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-navy-300 text-sm">Stories & posts réseaux</h4>
            <p className="text-xs text-navy-500 mt-1">Visuels à télécharger</p>
            <span className="inline-flex items-center rounded-full bg-navy-800 px-2 py-0.5 text-[10px] font-bold text-navy-400 mt-3 border border-navy-700">
              Bientôt
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-navy-850 bg-navy-900/40 flex items-start gap-4 opacity-70">
          <div className="rounded-xl bg-navy-800 p-2.5 text-navy-500 shrink-0 border border-navy-700">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-navy-300 text-sm">Affiche PDF A4</h4>
            <p className="text-xs text-navy-500 mt-1">Pour impression</p>
            <span className="inline-flex items-center rounded-full bg-navy-800 px-2 py-0.5 text-[10px] font-bold text-navy-400 mt-3 border border-navy-700">
              Bientôt
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-gold-500" />
          Scripts WhatsApp à copier
        </h3>

        <div className="space-y-4">
          {WHATSAPP_SCRIPTS.map((script, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-navy-850 bg-navy-950/40 space-y-3"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400">
                  {script.title}
                </h4>
                <button
                  type="button"
                  aria-label={`Copier le script ${script.title}`}
                  onClick={() => handleCopyScript(script.content, idx)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-navy-900 border border-navy-800 hover:border-navy-700 text-xs font-semibold rounded-lg text-navy-200 transition-colors"
                >
                  {copiedIndex === idx ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-sm text-navy-300 leading-relaxed font-mono p-3 rounded-xl bg-navy-950 border border-navy-900/50 break-words whitespace-pre-wrap">
                {script.content}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-2xl border border-gold-500/20 bg-gold-500/5 flex gap-3 text-gold-400 text-xs sm:text-sm">
        <AlertTriangle className="h-5 w-5 shrink-0 text-gold-500" />
        <div>
          <span className="font-bold text-white uppercase block mb-1">
            Règles importantes d&apos;éthique :
          </span>
          <span>
            Ne jamais promettre des études gratuites, une bourse ou réduire les frais KPB sans
            autorisation écrite de la direction. Tout abus entraînera la suspension immédiate de
            votre compte ambassadeur.
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarketingKit;
