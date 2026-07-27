export type Role = "agent" | "commercial" | "admin";
export type AgentStatut = "quiz_pending" | "quiz_failed" | "essai" | "officiel";
export type AgentTier = "bronze" | "argent" | "elite";
export type LeadStatut = "nouveau" | "contacte" | "qualifie" | "acompte_paye" | "place";
export type CommissionType =
  | "placement"
  | "apport_ecole"
  | "bonus_palier"
  | "prime_scolarite"
  | "bonus_dossier";
export type CommissionStatut =
  | "pending"
  | "attente_ecole"
  | "payable"
  | "paid"
  | "gelee"
  | "annulee"
  | "caduque";

export interface Profile {
  id: string;
  email: string;
  nom: string;
  role: Role;
  created_at: string;
}

export interface Agent {
  id: string;
  nom: string;
  email: string;
  whatsapp: string;
  pays: string;
  niveau_etudes: string;
  motivation: string | null;
  statut: AgentStatut;
  tier: AgentTier;
  code_parrainage: string;
  parrain_id: string | null;
  quiz_score: number | null;
  quiz_passed_at: string | null;
  quiz_retry_at: string | null;
  placements_count: number;
  date_naissance?: string | null;
  contrat_signe_at?: string | null;
  contrat_id?: string | null;
  periode_debut?: string | null;
  placements_periode?: number;
  created_at: string;
}

export interface Lead {
  id: string;
  agent_id: string;
  assigned_to: string;
  nom: string;
  email: string | null;
  whatsapp: string | null;
  pays: string;
  destination: string;
  statut: LeadStatut;
  /** @deprecated Legacy field */
  bonus_paid: boolean;
  montant_service: number | null;
  commission_amount: number;
  notes: string | null;
  ecole_campus_id?: string | null;
  admission_confirmee_at?: string | null;
  scolarite_soldee_at?: string | null;
  justificatif_paiement_path?: string | null;
  ecole_commission_attendue?: number | null;
  ecole_commission_devise?: string | null;
  ecole_commission_recue_at?: string | null;
  ecole_commission_montant?: number | null;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  agent_id: string;
  lead_id: string | null;
  type: CommissionType;
  montant: number;
  statut: CommissionStatut;
  taux_applique?: number | null;
  bareme_version?: string | null;
  devise?: string;
  assiette?: string;
  condition_paiement?: string;
  montant_previsionnel?: number | null;
  payable_at?: string | null;
  created_at: string;
}

export interface Contract {
  id: string;
  agent_id: string;
  version: string;
  bareme_snapshot: unknown;
  pdf_path: string;
  sha256: string;
  status: "draft" | "signed" | "superseded" | "revoked";
  signed_at: string | null;
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
