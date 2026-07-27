import React, { useState } from "react";
import { Lead, LeadStatut } from "@/types";
import { formatCurrency, STATUTS_LEAD, whatsappLink } from "@/lib/utils";
import {
  MessageSquare,
  Calendar,
  Globe,
  Loader2,
  Sparkles,
  Save,
  StickyNote,
  Banknote,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadCardProps {
  lead: Lead;
  agentNom?: string; // Optional agent name
  onStatusChange: (leadId: string, newStatus: LeadStatut) => Promise<void>;
  onSetMontant: (leadId: string, montant: number | null) => Promise<void>;
  onNotesSave: (leadId: string, notes: string) => Promise<void>;
  isNew?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  agentNom,
  onStatusChange,
  onSetMontant,
  onNotesSave,
  isNew = false,
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [montant, setMontant] = useState(
    lead.montant_service != null ? String(lead.montant_service) : "",
  );
  const [savingMontant, setSavingMontant] = useState(false);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);

  const montantNum = montant.trim() === "" ? null : Number(montant.replace(",", "."));
  const montantValid = montantNum === null || (Number.isFinite(montantNum) && montantNum >= 0);
  const montantDirty = montantNum !== (lead.montant_service ?? null);
  const notesDirty = (notes ?? "").trim() !== (lead.notes ?? "").trim();
  const waLink = whatsappLink(lead.whatsapp);

  const getStatusLabel = (status: LeadStatut) => {
    switch (status) {
      case "nouveau":
        return "Nouveau";
      case "contacte":
        return "Contacté";
      case "qualifie":
        return "Qualifié";
      case "acompte_paye":
        return "Frais payés";
      case "place":
        return "Placé ✅";
      default:
        return status;
    }
  };

  const handleStatusChangeLocal = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as LeadStatut;
    setUpdatingStatus(true);
    try {
      await onStatusChange(lead.id, val);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMontantSave = async () => {
    if (!montantValid) return;
    setSavingMontant(true);
    try {
      await onSetMontant(lead.id, montantNum);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingMontant(false);
    }
  };

  const handleNotesSave = async () => {
    setSavingNotes(true);
    try {
      await onNotesSave(lead.id, notes.trim());
    } catch (err) {
      console.error(err);
    } finally {
      setSavingNotes(false);
    }
  };

  const formattedDate = new Date(lead.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "p-6 rounded-2xl border bg-white shadow-sm transition-all duration-300 relative flex flex-col gap-4 hover:shadow-md",
        isNew
          ? "border-gold-500 ring-2 ring-gold-500/20 bg-gold-50/10 animate-pulse-gold"
          : "border-slate-200",
      )}
    >
      {isNew && (
        <span className="absolute -top-2.5 -left-2.5 bg-gold-500 text-navy-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <Sparkles className="h-3 w-3" />
          Nouveau Lead
        </span>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Profile detail */}
        <div className="flex items-start gap-4 flex-1">
          <div className="rounded-full bg-slate-100 text-slate-700 font-bold h-12 w-12 flex items-center justify-center shrink-0">
            {lead.nom.charAt(0).toUpperCase()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-base">{lead.nom}</h4>
              <span className="text-xs text-slate-400 font-medium">({lead.pays})</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                Dest : <strong className="text-slate-700">{lead.destination}</strong>
              </span>
              {waLink ? (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                  title="Ouvrir la conversation WhatsApp"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {lead.whatsapp}
                </a>
              ) : (
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                  Pas de WhatsApp
                </span>
              )}
              <span className="flex items-center gap-1 col-span-2 sm:col-span-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Créé le {formattedDate}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 pt-1">
              Via Agent :{" "}
              <span className="font-semibold text-slate-700">{agentNom || "Agent Inconnu"}</span>
            </div>
          </div>
        </div>

        {/* Interactions panel */}
        <div className="flex flex-wrap items-center gap-4 md:justify-end">
          {/* Montant du service payé (base de la commission) */}
          <div className="space-y-1">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">
              Montant service (FCFA)
            </span>
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <Banknote className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={montant}
                  onChange={(e) => setMontant(e.target.value)}
                  placeholder="0"
                  className="w-28 rounded-lg border border-slate-200 pl-7 pr-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={handleMontantSave}
                disabled={!montantDirty || !montantValid || savingMontant}
                title="Enregistrer le montant (recalcule la commission)"
                className="inline-flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {savingMontant ? (
                  <Loader2 className="animate-spin h-3.5 w-3.5" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">
              Statut Lead
            </span>
            <div className="relative">
              <select
                value={lead.statut}
                disabled={updatingStatus}
                onChange={handleStatusChangeLocal}
                className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white appearance-none pr-8 cursor-pointer"
              >
                {STATUTS_LEAD.map((s) => (
                  <option key={s} value={s}>
                    {getStatusLabel(s)}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </span>
            </div>
          </div>

          {/* Commission indicator */}
          <div className="space-y-1 text-left md:text-right border-l border-slate-100 pl-4">
            <span className="block text-[10px] text-slate-400 uppercase font-semibold">
              Comm. Agent (FCFA)
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {lead.commission_amount > 0 ? (
                <span className="text-emerald-600">
                  {formatCurrency(lead.commission_amount, "XOF")}
                </span>
              ) : (
                <span className="text-slate-400">À calculer</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="border-t border-slate-100 pt-3">
        <label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
          <StickyNote className="h-3.5 w-3.5" />
          Notes de suivi
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Résultat de l'appel, prochaine relance, infos utiles..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-y"
          />
          <button
            onClick={handleNotesSave}
            disabled={!notesDirty || savingNotes}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors self-start sm:self-stretch disabled:opacity-40 disabled:cursor-not-allowed bg-slate-800 hover:bg-slate-900 text-white"
          >
            {savingNotes ? (
              <Loader2 className="animate-spin h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
