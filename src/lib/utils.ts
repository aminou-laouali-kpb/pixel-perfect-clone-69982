import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AgentTier } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TIERS = {
  bronze: { label: 'Bronze 🥉', commission: 0.10, min: 0, max: 2, color: '#CD7F32' },
  argent: { label: 'Argent 🥈', commission: 0.12, min: 3, max: 9, color: '#A8A8A8' },
  elite:  { label: 'Élite 🥇',  commission: 0.15, min: 10, max: Infinity, color: '#F5A623' },
};

export function calculateTier(placements: number): AgentTier {
  if (placements >= 10) return 'elite';
  if (placements >= 3) return 'argent';
  return 'bronze';
}

export const STATUTS_LEAD = ['nouveau', 'contacte', 'qualifie', 'acompte_paye', 'place'] as const;

// Bonus paliers (FCFA) versés à l'atteinte d'un nombre de parrainages réussis.
export const MILESTONE_BONUSES = [
  { placements: 3, montant: 20000 },
  { placements: 5, montant: 50000 },
  { placements: 10, montant: 100000 },
] as const;

// Destinations partenaires KPB (offre fusionnée).
export const DESTINATIONS = [
  'France', 'Allemagne', 'Espagne', 'Maroc', 'Turquie', 'Canada', 'Dubaï', 'USA',
];

export const COMMERCIAUX = ['Josphin', 'Donald', 'Richard'];

// Challenge « tableau d'honneur » : période d'inscription en cours.
export const CURRENT_PERIOD = {
  label: '10 juin → 10 octobre 2026',
  start: '2026-06-10T00:00:00Z',
  end: '2026-10-11T00:00:00Z', // borne exclusive (10 octobre inclus)
};

// Récompenses du podium (top 3 parrains de la période).
export const CHALLENGE_PRIZES = [
  { rang: 1, prix: 'Smartphone ou tablette', emoji: '🥇' },
  { rang: 2, prix: 'Accessoire électronique', emoji: '🥈' },
  { rang: 3, prix: 'Gadget', emoji: '🥉' },
];

/**
 * Builds a wa.me link from a phone number (strips '+', spaces, etc.).
 * Returns null when there is no usable number.
 */
export function whatsappLink(num?: string | null): string | null {
  if (!num) return null;
  const digits = num.replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

export function formatCurrency(amount: number, currency: 'EUR' | 'XOF' = 'EUR'): string {
  if (currency === 'XOF') {
    // Format to XOF (CFA Franc)
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0
    }).format(amount);
  }
  // Format to EUR
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
