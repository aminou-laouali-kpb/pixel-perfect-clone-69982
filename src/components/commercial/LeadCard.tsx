import React, { useEffect, useState } from "react";
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
  ShieldCheck,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type CampusOption = {
  id: string;
  ville: string;
  pays: string;
  eligible_prime: boolean;
  ecoles: { nom: string } | null;
};

interface LeadCardProps {
  lead: Lead;
  agentNom?: string;
  onStatusChange: (leadId: string, newStatus: LeadStatut) => Promise<void>;
  onSetMontant: (leadId: string, montant: number | null) => Promise<void>;
  onNotesSave: (leadId: string, notes: string) => Promise<void>;
  onValidatePlacement: (args: {
    leadId: string;
    montant: number;
    justificatif: string;
    campusId: string | null;
    commissionAttendue: number | null;
  }) => Promise<void>;
  onMarkScolariteSoldee: (leadId: string, justificatif: string) => Promise<void>;
  isNew?: boolean;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  agentNom,
  onStatusChange,
  onSetMontant,
  onNotesSave,
  onValidatePlacement,
  onMarkScolariteSoldee,
  isNew = false,
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [montant, setMontant] = useState(
    lead.montant_service != null ? String(lead.montant_service) : "",
  );
  const [savingMontant, setSavingMontant] = useState(false);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [campuses, setCampuses] = useState<CampusOption[]>([]);
  const [campusId, setCampusId] = useState(lead.ecole_campus_id ?? "");
  const [justificatif, setJustificatif] = useState(lead.justificatif_paiement_path ?? "");
  const [commissionAttendue, setCommissionAttendue] = useState(
    lead.ecole_commission_attendue != null ? String(lead.ecole_commission_attendue) : "",
  );
  const [validating, setValidating] = useState(false);
  const [markingScolarite, setMarkingScolarite] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("ecoles_campus")
        .select("id, ville, pays, eligible_prime, ecoles(nom)")
        .eq("actif", true)
        .order("pays");
      if (!cancelled && data) setCampuses(data as unknown as CampusOption[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const montantNum = montant.trim() === "" ? null : Number(montant.replace(",", "."));
  const montantValid = montantNum === null || (Number.isFinite(montantNum) && montantNum >= 0);
  const montantDirty = montantNum !== (lead.montant_service ?? null);
  const notesDirty = (notes ?? "").trim() !== (lead.notes ?? "").trim();
  const waLink = whatsappLink(lead.whatsapp);
  const attendueNum =
    commissionAttendue.trim() === "" ? null : Number(commissionAttendue.replace(",", "."));

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

  const handleValidate = async () => {
    if (!montantNum || montantNum <= 0 || !justificatif.trim()) return;
    setValidating(true);
    try {
      await onValidatePlacement({
        leadId: lead.id,
        montant: montantNum,
        justificatif: justificatif.trim(),
        campusId: campusId || null,
        commissionAttendue:
          attendueNum != null && Number.isFinite(attendueNum) ? attendueNum : null,
      });
    } finally {
      setValidating(false);
    }
  };

  const handleScolarite = async () => {
    if (!justificatif.trim()) return;
    setMarkingScolarite(true);
    try {
      await onMarkScolariteSoldee(lead.id, justificatif.trim());
    } finally {
      setMarkingScolarite(false);
    }
  };

  const formattedDate = new Date(lead.created_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const canValidate =
    Boolean(montantNum && montantNum > 0 && justificatif.trim()) && !lead.admission_confirmee_at;

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
              {lead.admission_confirmee_at && (
                <span className="ml-2 text-emerald-600 font-semibold">· Admission confirmée</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 md:justify-end">
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
                title="Enregistrer le montant"
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
                <span className="text-slate-400">À valider</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Validation placement (art. 12 + Annexe 5) */}
      <div className="border-t border-slate-100 pt-3 space-y-3">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Validation placement (admission + justificatif)
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          <select
            value={campusId}
            onChange={(e) => setCampusId(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 bg-white"
          >
            <option value="">Campus d&apos;inscription…</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.ecoles?.nom ?? "École"} — {c.ville} ({c.pays})
                {c.eligible_prime ? " · prime OK" : ""}
              </option>
            ))}
          </select>
          <input
            value={justificatif}
            onChange={(e) => setJustificatif(e.target.value)}
            placeholder="Chemin / URL justificatif paiement"
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700"
          />
          <input
            type="number"
            min="0"
            value={commissionAttendue}
            onChange={(e) => setCommissionAttendue(e.target.value)}
            placeholder="Commission école attendue (prévisionnel)"
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleValidate}
              disabled={!canValidate || validating}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 text-xs font-bold disabled:opacity-40"
            >
              {validating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5" />
              )}
              Valider placement
            </button>
            <button
              type="button"
              onClick={handleScolarite}
              disabled={
                !justificatif.trim() || Boolean(lead.scolarite_soldee_at) || markingScolarite
              }
              title="Scolarité 100 % réglée → prime si campus FR"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 text-xs font-bold disabled:opacity-40"
            >
              {markingScolarite ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <GraduationCap className="h-3.5 w-3.5" />
              )}
              Scolarité soldée
            </button>
          </div>
        </div>
        {lead.scolarite_soldee_at && (
          <p className="text-[11px] text-emerald-600">
            Scolarité soldée le {new Date(lead.scolarite_soldee_at).toLocaleDateString("fr-FR")}
          </p>
        )}
      </div>

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
