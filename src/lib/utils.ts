import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AgentTier } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Barème v3.1 — Annexe 1 (taux figés à la création de commission côté serveur). */
export const TIERS = {
  bronze: { label: "Bronze", commission: 0.15, min: 1, max: 5, color: "#CD7F32" },
  argent: { label: "Argent", commission: 0.2, min: 6, max: 10, color: "#A8A8A8" },
  elite: { label: "Élite", commission: 0.3, min: 11, max: Infinity, color: "#F5A623" },
};

/** Palier selon le nombre de parrainages validés de la période contractuelle. */
export function calculateTier(placementsPeriode: number): AgentTier {
  if (placementsPeriode >= 11) return "elite";
  if (placementsPeriode >= 6) return "argent";
  return "bronze";
}

export function tauxForPlacements(placementsPeriode: number): number {
  return TIERS[calculateTier(Math.max(placementsPeriode, 1))].commission;
}

export const STATUTS_LEAD = ["nouveau", "contacte", "qualifie", "acompte_paye", "place"] as const;

export const MILESTONE_BONUSES = [
  { placements: 3, montant: 20000 },
  { placements: 5, montant: 50000 },
  { placements: 10, montant: 100000 },
] as const;

export const PRIME_SCOLARITE_USD = 150;
export const DELAI_SECURITE_JOURS = 45;
export const SEUIL_VERSEMENT_XOF = 30000;

export const DESTINATIONS = [
  "France",
  "Allemagne",
  "Espagne",
  "Maroc",
  "Turquie",
  "Canada",
  "Dubaï",
  "USA",
];

/** @deprecated Prefer live `rr_state` from Supabase — kept for display fallbacks only. */
export const COMMERCIAUX = ["Josphin", "Donald", "Richard"];

export const CURRENT_PERIOD = {
  label: "10 juin → 10 octobre 2026",
  start: "2026-06-10T00:00:00Z",
  end: "2026-10-11T00:00:00Z",
};

export const CHALLENGE_PRIZES = [
  { rang: 1, prix: "Smartphone ou tablette" },
  { rang: 2, prix: "Accessoire électronique" },
  { rang: 3, prix: "Gadget" },
];

export function whatsappLink(num?: string | null): string | null {
  if (!num) return null;
  const digits = num.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

export function formatCurrency(amount: number, currency: "EUR" | "XOF" | "USD" = "EUR"): string {
  if (currency === "XOF") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
  }).format(amount);
}

/** True if agent may actively refer (signed contract). */
export function hasSignedContract(agent: { contrat_signe_at?: string | null }): boolean {
  return Boolean(agent.contrat_signe_at);
}
