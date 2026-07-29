export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      agents: {
        Row: {
          code_parrainage: string;
          contrat_id: string | null;
          contrat_signe_at: string | null;
          created_at: string;
          date_naissance: string | null;
          email: string;
          id: string;
          motivation: string | null;
          niveau_etudes: string;
          nom: string;
          parrain_id: string | null;
          pays: string;
          periode_debut: string | null;
          placements_count: number;
          placements_periode: number;
          quiz_passed_at: string | null;
          quiz_retry_at: string | null;
          quiz_score: number | null;
          statut: Database["public"]["Enums"]["agent_statut"];
          tier: Database["public"]["Enums"]["agent_tier"];
          whatsapp: string;
        };
        Insert: {
          code_parrainage: string;
          contrat_id?: string | null;
          contrat_signe_at?: string | null;
          created_at?: string;
          date_naissance?: string | null;
          email: string;
          id: string;
          motivation?: string | null;
          niveau_etudes: string;
          nom: string;
          parrain_id?: string | null;
          pays: string;
          periode_debut?: string | null;
          placements_count?: number;
          placements_periode?: number;
          quiz_passed_at?: string | null;
          quiz_retry_at?: string | null;
          quiz_score?: number | null;
          statut?: Database["public"]["Enums"]["agent_statut"];
          tier?: Database["public"]["Enums"]["agent_tier"];
          whatsapp: string;
        };
        Update: {
          code_parrainage?: string;
          contrat_id?: string | null;
          contrat_signe_at?: string | null;
          created_at?: string;
          date_naissance?: string | null;
          email?: string;
          id?: string;
          motivation?: string | null;
          niveau_etudes?: string;
          nom?: string;
          parrain_id?: string | null;
          pays?: string;
          periode_debut?: string | null;
          placements_count?: number;
          placements_periode?: number;
          quiz_passed_at?: string | null;
          quiz_retry_at?: string | null;
          quiz_score?: number | null;
          statut?: Database["public"]["Enums"]["agent_statut"];
          tier?: Database["public"]["Enums"]["agent_tier"];
          whatsapp?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agents_contrat_id_fkey";
            columns: ["contrat_id"];
            isOneToOne: false;
            referencedRelation: "contracts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "agents_parrain_id_fkey";
            columns: ["parrain_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      bareme_versions: {
        Row: {
          contenu: Json;
          created_at: string;
          effective_from: string;
          is_current: boolean;
          version: string;
        };
        Insert: {
          contenu: Json;
          created_at?: string;
          effective_from: string;
          is_current?: boolean;
          version: string;
        };
        Update: {
          contenu?: Json;
          created_at?: string;
          effective_from?: string;
          is_current?: boolean;
          version?: string;
        };
        Relationships: [];
      };
      commissions: {
        Row: {
          agent_id: string;
          assiette: string;
          bareme_version: string | null;
          condition_paiement: string;
          created_at: string;
          devise: string;
          id: string;
          justificatif_path: string | null;
          lead_id: string | null;
          montant: number;
          montant_previsionnel: number | null;
          motif_annulation: string | null;
          payable_at: string | null;
          periode_debut: string | null;
          reversal_of: string | null;
          statut: Database["public"]["Enums"]["commission_statut"];
          taux_applique: number | null;
          type: Database["public"]["Enums"]["commission_type"];
        };
        Insert: {
          agent_id: string;
          assiette?: string;
          bareme_version?: string | null;
          condition_paiement?: string;
          created_at?: string;
          devise?: string;
          id?: string;
          justificatif_path?: string | null;
          lead_id?: string | null;
          montant: number;
          montant_previsionnel?: number | null;
          motif_annulation?: string | null;
          payable_at?: string | null;
          periode_debut?: string | null;
          reversal_of?: string | null;
          statut?: Database["public"]["Enums"]["commission_statut"];
          taux_applique?: number | null;
          type: Database["public"]["Enums"]["commission_type"];
        };
        Update: {
          agent_id?: string;
          assiette?: string;
          bareme_version?: string | null;
          condition_paiement?: string;
          created_at?: string;
          devise?: string;
          id?: string;
          justificatif_path?: string | null;
          lead_id?: string | null;
          montant?: number;
          montant_previsionnel?: number | null;
          motif_annulation?: string | null;
          payable_at?: string | null;
          periode_debut?: string | null;
          reversal_of?: string | null;
          statut?: Database["public"]["Enums"]["commission_statut"];
          taux_applique?: number | null;
          type?: Database["public"]["Enums"]["commission_type"];
        };
        Relationships: [
          {
            foreignKeyName: "commissions_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commissions_bareme_version_fkey";
            columns: ["bareme_version"];
            isOneToOne: false;
            referencedRelation: "bareme_versions";
            referencedColumns: ["version"];
          },
          {
            foreignKeyName: "commissions_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "commissions_reversal_of_fkey";
            columns: ["reversal_of"];
            isOneToOne: false;
            referencedRelation: "commissions";
            referencedColumns: ["id"];
          },
        ];
      };
      contracts: {
        Row: {
          accepted_age_18: boolean;
          accepted_full_name: string;
          accepted_image: boolean;
          accepted_terms: boolean;
          agent_id: string;
          bareme_snapshot: Json;
          created_at: string;
          id: string;
          kpb_signatory_name: string;
          kpb_signatory_role: string;
          kpb_signature_path: string | null;
          pdf_path: string;
          sha256: string;
          signature_path: string | null;
          signed_at: string | null;
          signed_ip: unknown;
          signed_user_agent: string | null;
          status: string;
          superseded_by: string | null;
          version: string;
        };
        Insert: {
          accepted_age_18?: boolean;
          accepted_full_name?: string;
          accepted_image?: boolean;
          accepted_terms?: boolean;
          agent_id: string;
          bareme_snapshot: Json;
          created_at?: string;
          id?: string;
          kpb_signatory_name?: string;
          kpb_signatory_role?: string;
          kpb_signature_path?: string | null;
          pdf_path: string;
          sha256: string;
          signature_path?: string | null;
          signed_at?: string | null;
          signed_ip?: unknown;
          signed_user_agent?: string | null;
          status?: string;
          superseded_by?: string | null;
          version: string;
        };
        Update: {
          accepted_age_18?: boolean;
          accepted_full_name?: string;
          accepted_image?: boolean;
          accepted_terms?: boolean;
          agent_id?: string;
          bareme_snapshot?: Json;
          created_at?: string;
          id?: string;
          kpb_signatory_name?: string;
          kpb_signatory_role?: string;
          kpb_signature_path?: string | null;
          pdf_path?: string;
          sha256?: string;
          signature_path?: string | null;
          signed_at?: string | null;
          signed_ip?: unknown;
          signed_user_agent?: string | null;
          status?: string;
          superseded_by?: string | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contracts_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contracts_superseded_by_fkey";
            columns: ["superseded_by"];
            isOneToOne: false;
            referencedRelation: "contracts";
            referencedColumns: ["id"];
          },
        ];
      };
      ecoles: {
        Row: {
          created_at: string;
          groupe: string | null;
          id: string;
          nom: string;
        };
        Insert: {
          created_at?: string;
          groupe?: string | null;
          id?: string;
          nom: string;
        };
        Update: {
          created_at?: string;
          groupe?: string | null;
          id?: string;
          nom?: string;
        };
        Relationships: [];
      };
      ecoles_campus: {
        Row: {
          actif: boolean;
          ecole_id: string;
          eligible_prime: boolean;
          id: string;
          pays: string;
          ville: string;
        };
        Insert: {
          actif?: boolean;
          ecole_id: string;
          eligible_prime?: boolean;
          id?: string;
          pays: string;
          ville: string;
        };
        Update: {
          actif?: boolean;
          ecole_id?: string;
          eligible_prime?: boolean;
          id?: string;
          pays?: string;
          ville?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ecoles_campus_ecole_id_fkey";
            columns: ["ecole_id"];
            isOneToOne: false;
            referencedRelation: "ecoles";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          admission_confirmee_at: string | null;
          agent_id: string;
          assigned_to: string;
          bonus_paid: boolean;
          commission_amount: number;
          created_at: string;
          destination: string;
          ecole_campus_id: string | null;
          ecole_commission_attendue: number | null;
          ecole_commission_devise: string | null;
          ecole_commission_montant: number | null;
          ecole_commission_recue_at: string | null;
          email: string | null;
          id: string;
          justificatif_paiement_path: string | null;
          montant_service: number | null;
          nom: string;
          notes: string | null;
          pays: string;
          scolarite_soldee_at: string | null;
          statut: Database["public"]["Enums"]["lead_statut"];
          updated_at: string;
          whatsapp: string | null;
        };
        Insert: {
          admission_confirmee_at?: string | null;
          agent_id: string;
          assigned_to: string;
          bonus_paid?: boolean;
          commission_amount?: number;
          created_at?: string;
          destination: string;
          ecole_campus_id?: string | null;
          ecole_commission_attendue?: number | null;
          ecole_commission_devise?: string | null;
          ecole_commission_montant?: number | null;
          ecole_commission_recue_at?: string | null;
          email?: string | null;
          id?: string;
          justificatif_paiement_path?: string | null;
          montant_service?: number | null;
          nom: string;
          notes?: string | null;
          pays: string;
          scolarite_soldee_at?: string | null;
          statut?: Database["public"]["Enums"]["lead_statut"];
          updated_at?: string;
          whatsapp?: string | null;
        };
        Update: {
          admission_confirmee_at?: string | null;
          agent_id?: string;
          assigned_to?: string;
          bonus_paid?: boolean;
          commission_amount?: number;
          created_at?: string;
          destination?: string;
          ecole_campus_id?: string | null;
          ecole_commission_attendue?: number | null;
          ecole_commission_devise?: string | null;
          ecole_commission_montant?: number | null;
          ecole_commission_recue_at?: string | null;
          email?: string | null;
          id?: string;
          justificatif_paiement_path?: string | null;
          montant_service?: number | null;
          nom?: string;
          notes?: string | null;
          pays?: string;
          scolarite_soldee_at?: string | null;
          statut?: Database["public"]["Enums"]["lead_statut"];
          updated_at?: string;
          whatsapp?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_ecole_campus_id_fkey";
            columns: ["ecole_campus_id"];
            isOneToOne: false;
            referencedRelation: "ecoles_campus";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          nom: string;
          role: Database["public"]["Enums"]["user_role"];
        };
        Insert: {
          created_at?: string;
          email: string;
          id: string;
          nom: string;
          role?: Database["public"]["Enums"]["user_role"];
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          nom?: string;
          role?: Database["public"]["Enums"]["user_role"];
        };
        Relationships: [];
      };
      rr_state: {
        Row: {
          commercial: string;
          email: string;
          id: number;
          leads_total: number;
          rr_index: number;
          whatsapp: string;
        };
        Insert: {
          commercial: string;
          email: string;
          id?: number;
          leads_total?: number;
          rr_index?: number;
          whatsapp: string;
        };
        Update: {
          commercial?: string;
          email?: string;
          id?: number;
          leads_total?: number;
          rr_index?: number;
          whatsapp?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      assign_lead_round_robin: { Args: { p_lead_id: string }; Returns: string };
      create_placement_commission: {
        Args: { p_lead_id: string };
        Returns: undefined;
      };
      create_prime_scolarite: { Args: { p_lead_id: string }; Returns: Json };
      current_commercial_name: { Args: never; Returns: string };
      current_user_role: {
        Args: never;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      freeze_commissions: {
        Args: { p_agent_id: string; p_motif: string };
        Returns: number;
      };
      get_agent_rank: { Args: never; Returns: number };
      get_contract_for_commercial: {
        Args: { p_contract_id: string };
        Returns: Json;
      };
      get_leaderboard: {
        Args: { p_end: string; p_limit?: number; p_start: string };
        Returns: {
          placements: number;
          prenom: string;
          rang: number;
        }[];
      };
      get_my_contract_download: { Args: never; Returns: Json };
      lapse_school_commissions: { Args: never; Returns: number };
      list_agents_basic: {
        Args: never;
        Returns: {
          id: string;
          nom: string;
        }[];
      };
      list_rr_state_basic: {
        Args: never;
        Returns: {
          commercial: string;
          id: number;
          leads_total: number;
        }[];
      };
      list_users_for_admin: {
        Args: never;
        Returns: {
          created_at: string;
          email: string;
          id: string;
          nom: string;
          role: Database["public"]["Enums"]["user_role"];
        }[];
      };
      mark_payable: { Args: never; Returns: number };
      mark_scolarite_soldee: {
        Args: { p_justificatif_path: string; p_lead_id: string };
        Returns: Json;
      };
      prepare_contract: { Args: never; Returns: Json };
      record_school_commission: {
        Args: {
          p_devise: string;
          p_lead_id: string;
          p_montant: number;
          p_recu_le?: string;
        };
        Returns: Json;
      };
      reverse_commission: {
        Args: { p_id: string; p_motif: string };
        Returns: Json;
      };
      revise_tiers: { Args: never; Returns: number };
      set_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["user_role"];
          p_user_id: string;
        };
        Returns: undefined;
      };
      sign_contract: {
        Args: {
          p_accepted_age_18: boolean;
          p_accepted_image: boolean;
          p_accepted_terms: boolean;
          p_contract_id: string;
          p_full_name: string;
          p_signature_b64: string;
          p_user_agent?: string;
        };
        Returns: Json;
      };
      submit_quiz_attempt: { Args: { p_answers: number[] }; Returns: Json };
      submit_referral_lead: {
        Args: {
          p_code: string;
          p_destination?: string;
          p_email?: string;
          p_nom: string;
          p_notes?: string;
          p_pays?: string;
          p_whatsapp: string;
        };
        Returns: Json;
      };
      taux_for_placements: { Args: { p_count: number }; Returns: number };
      tier_for_placements: {
        Args: { p_count: number };
        Returns: Database["public"]["Enums"]["agent_tier"];
      };
      unaccent: { Args: { "": string }; Returns: string };
      validate_placement: {
        Args: {
          p_ecole_campus_id?: string;
          p_ecole_commission_attendue?: number;
          p_ecole_commission_devise?: string;
          p_justificatif_path: string;
          p_lead_id: string;
          p_montant_service: number;
        };
        Returns: Json;
      };
    };
    Enums: {
      agent_statut: "quiz_pending" | "quiz_failed" | "essai" | "officiel";
      agent_tier: "bronze" | "argent" | "elite";
      commission_statut:
        "pending" | "paid" | "attente_ecole" | "payable" | "gelee" | "annulee" | "caduque";
      commission_type:
        "bonus_dossier" | "placement" | "bonus_palier" | "apport_ecole" | "prime_scolarite";
      lead_statut: "nouveau" | "contacte" | "qualifie" | "acompte_paye" | "place";
      user_role: "agent" | "commercial" | "admin";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      agent_statut: ["quiz_pending", "quiz_failed", "essai", "officiel"],
      agent_tier: ["bronze", "argent", "elite"],
      commission_statut: [
        "pending",
        "paid",
        "attente_ecole",
        "payable",
        "gelee",
        "annulee",
        "caduque",
      ],
      commission_type: [
        "bonus_dossier",
        "placement",
        "bonus_palier",
        "apport_ecole",
        "prime_scolarite",
      ],
      lead_statut: ["nouveau", "contacte", "qualifie", "acompte_paye", "place"],
      user_role: ["agent", "commercial", "admin"],
    },
  },
} as const;
