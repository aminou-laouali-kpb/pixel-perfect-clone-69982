export type Role = 'agent' | 'commercial' | 'admin';
export type AgentStatut = 'quiz_pending' | 'quiz_failed' | 'essai' | 'officiel';
export type AgentTier = 'bronze' | 'argent' | 'elite';
export type LeadStatut = 'nouveau' | 'contacte' | 'qualifie' | 'acompte_paye' | 'place';
export type CommissionType = 'placement' | 'bonus_palier' | 'bonus_dossier';
export type CommissionStatut = 'pending' | 'paid';

export interface Profile {
  id: string;                    // = auth.users.id
  email: string;
  nom: string;
  role: Role;
  created_at: string;
}

export interface Agent {
  id: string;                    // = auth.users.id
  nom: string;
  email: string;
  whatsapp: string;
  pays: string;
  niveau_etudes: string;
  motivation?: string;
  statut: AgentStatut;
  tier: AgentTier;
  code_parrainage: string;       // unique, generated at signup
  parrain_id: string | null;     // FK -> agents.id (the agent who referred this one)
  quiz_score: number | null;
  quiz_passed_at: string | null;
  quiz_retry_at: string | null;
  placements_count: number;      // calculated by trigger
  created_at: string;
}

export interface Lead {
  id: string;
  agent_id: string;              // FK -> agents
  assigned_to: string;           // Commercial name (Josphin / Donald / Richard)
  nom: string;
  email: string | null;
  whatsapp: string | null;
  pays: string;
  destination: string;
  statut: LeadStatut;
  bonus_paid: boolean;           // legacy (bonus dossier supprimé)
  montant_service: number | null; // montant réel du service payé (base de la commission)
  commission_amount: number;     // commission de placement calculée (taux × montant_service)
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  agent_id: string;
  lead_id: string | null;        // null pour les bonus paliers (non rattachés à un lead)
  type: CommissionType;
  montant: number;
  statut: CommissionStatut;
  created_at: string;
}

export interface RrState {
  id: number;
  commercial: string;
  rr_index: number;
  leads_total: number;
  email: string;
  whatsapp: string;
}
