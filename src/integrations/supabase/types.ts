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
          created_at: string;
          email: string;
          id: string;
          motivation: string | null;
          niveau_etudes: string;
          nom: string;
          parrain_id: string | null;
          pays: string;
          placements_count: number;
          quiz_passed_at: string | null;
          quiz_retry_at: string | null;
          quiz_score: number | null;
          statut: Database["public"]["Enums"]["agent_statut"];
          tier: Database["public"]["Enums"]["agent_tier"];
          whatsapp: string;
          date_naissance: string | null;
          contrat_signe_at: string | null;
          contrat_id: string | null;
          periode_debut: string | null;
          placements_periode: number;
        };
        Insert: {
          code_parrainage: string;
          created_at?: string;
          email: string;
          id: string;
          motivation?: string | null;
          niveau_etudes: string;
          nom: string;
          parrain_id?: string | null;
          pays: string;
          placements_count?: number;
          quiz_passed_at?: string | null;
          quiz_retry_at?: string | null;
          quiz_score?: number | null;
          statut?: Database["public"]["Enums"]["agent_statut"];
          tier?: Database["public"]["Enums"]["agent_tier"];
          whatsapp: string;
          date_naissance?: string | null;
          contrat_signe_at?: string | null;
          contrat_id?: string | null;
          periode_debut?: string | null;
          placements_periode?: number;
        };
        Update: {
          code_parrainage?: string;
          created_at?: string;
          email?: string;
          id?: string;
          motivation?: string | null;
          niveau_etudes?: string;
          nom?: string;
          parrain_id?: string | null;
          pays?: string;
          placements_count?: number;
          quiz_passed_at?: string | null;
          quiz_retry_at?: string | null;
          quiz_score?: number | null;
          statut?: Database["public"]["Enums"]["agent_statut"];
          tier?: Database["public"]["Enums"]["agent_tier"];
          whatsapp?: string;
          date_naissance?: string | null;
          contrat_signe_at?: string | null;
          contrat_id?: string | null;
          periode_debut?: string | null;
          placements_periode?: number;
        };
        Relationships: [
          {
            foreignKeyName: "agents_parrain_id_fkey";
            columns: ["parrain_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      commissions: {
        Row: {
          agent_id: string;
          created_at: string;
          id: string;
          lead_id: string | null;
          montant: number;
          statut: Database["public"]["Enums"]["commission_statut"];
          type: Database["public"]["Enums"]["commission_type"];
          taux_applique: number | null;
          bareme_version: string | null;
          devise: string;
          assiette: string;
          condition_paiement: string;
          montant_previsionnel: number | null;
          payable_at: string | null;
          justificatif_path: string | null;
          motif_annulation: string | null;
          reversal_of: string | null;
          periode_debut: string | null;
        };
        Insert: {
          agent_id: string;
          created_at?: string;
          id?: string;
          lead_id?: string | null;
          montant: number;
          statut?: Database["public"]["Enums"]["commission_statut"];
          type: Database["public"]["Enums"]["commission_type"];
          taux_applique?: number | null;
          bareme_version?: string | null;
          devise?: string;
          assiette?: string;
          condition_paiement?: string;
          montant_previsionnel?: number | null;
          payable_at?: string | null;
          justificatif_path?: string | null;
          motif_annulation?: string | null;
          reversal_of?: string | null;
          periode_debut?: string | null;
        };
        Update: {
          agent_id?: string;
          created_at?: string;
          id?: string;
          lead_id?: string | null;
          montant?: number;
          statut?: Database["public"]["Enums"]["commission_statut"];
          type?: Database["public"]["Enums"]["commission_type"];
          taux_applique?: number | null;
          bareme_version?: string | null;
          devise?: string;
          assiette?: string;
          condition_paiement?: string;
          montant_previsionnel?: number | null;
          payable_at?: string | null;
          justificatif_path?: string | null;
          motif_annulation?: string | null;
          reversal_of?: string | null;
          periode_debut?: string | null;
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
            foreignKeyName: "commissions_lead_id_fkey";
            columns: ["lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          agent_id: string;
          assigned_to: string;
          bonus_paid: boolean;
          commission_amount: number;
          created_at: string;
          destination: string;
          email: string | null;
          id: string;
          montant_service: number | null;
          nom: string;
          notes: string | null;
          pays: string;
          statut: Database["public"]["Enums"]["lead_statut"];
          updated_at: string;
          whatsapp: string | null;
          ecole_campus_id: string | null;
          admission_confirmee_at: string | null;
          scolarite_soldee_at: string | null;
          justificatif_paiement_path: string | null;
          ecole_commission_attendue: number | null;
          ecole_commission_devise: string | null;
          ecole_commission_recue_at: string | null;
          ecole_commission_montant: number | null;
        };
        Insert: {
          agent_id: string;
          assigned_to: string;
          bonus_paid?: boolean;
          commission_amount?: number;
          created_at?: string;
          destination: string;
          email?: string | null;
          id?: string;
          montant_service?: number | null;
          nom: string;
          notes?: string | null;
          pays: string;
          statut?: Database["public"]["Enums"]["lead_statut"];
          updated_at?: string;
          whatsapp?: string | null;
          ecole_campus_id?: string | null;
          admission_confirmee_at?: string | null;
          scolarite_soldee_at?: string | null;
          justificatif_paiement_path?: string | null;
          ecole_commission_attendue?: number | null;
          ecole_commission_devise?: string | null;
          ecole_commission_recue_at?: string | null;
          ecole_commission_montant?: number | null;
        };
        Update: {
          agent_id?: string;
          assigned_to?: string;
          bonus_paid?: boolean;
          commission_amount?: number;
          created_at?: string;
          destination?: string;
          email?: string | null;
          id?: string;
          montant_service?: number | null;
          nom?: string;
          notes?: string | null;
          pays?: string;
          statut?: Database["public"]["Enums"]["lead_statut"];
          updated_at?: string;
          whatsapp?: string | null;
          ecole_campus_id?: string | null;
          admission_confirmee_at?: string | null;
          scolarite_soldee_at?: string | null;
          justificatif_paiement_path?: string | null;
          ecole_commission_attendue?: number | null;
          ecole_commission_devise?: string | null;
          ecole_commission_recue_at?: string | null;
          ecole_commission_montant?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "leads_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };

      bareme_versions: {
        Row: {
          version: string;
          effective_from: string;
          contenu: Json;
          is_current: boolean;
          created_at: string;
        };
        Insert: {
          version: string;
          effective_from: string;
          contenu: Json;
          is_current?: boolean;
          created_at?: string;
        };
        Update: {
          version?: string;
          effective_from?: string;
          contenu?: Json;
          is_current?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      contracts: {
        Row: {
          id: string;
          agent_id: string;
          version: string;
          bareme_snapshot: Json;
          pdf_path: string;
          sha256: string;
          accepted_full_name: string;
          accepted_terms: boolean;
          accepted_age_18: boolean;
          accepted_image: boolean;
          signature_path: string | null;
          signed_at: string | null;
          signed_ip: string | null;
          signed_user_agent: string | null;
          kpb_signatory_name: string;
          kpb_signatory_role: string;
          kpb_signature_path: string | null;
          status: string;
          superseded_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          version: string;
          bareme_snapshot: Json;
          pdf_path: string;
          sha256: string;
          accepted_full_name?: string;
          accepted_terms?: boolean;
          accepted_age_18?: boolean;
          accepted_image?: boolean;
          signature_path?: string | null;
          signed_at?: string | null;
          signed_ip?: string | null;
          signed_user_agent?: string | null;
          kpb_signatory_name?: string;
          kpb_signatory_role?: string;
          kpb_signature_path?: string | null;
          status?: string;
          superseded_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          version?: string;
          bareme_snapshot?: Json;
          pdf_path?: string;
          sha256?: string;
          accepted_full_name?: string;
          accepted_terms?: boolean;
          accepted_age_18?: boolean;
          accepted_image?: boolean;
          signature_path?: string | null;
          signed_at?: string | null;
          signed_ip?: string | null;
          signed_user_agent?: string | null;
          kpb_signatory_name?: string;
          kpb_signatory_role?: string;
          kpb_signature_path?: string | null;
          status?: string;
          superseded_by?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "contracts_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
      };
      ecoles: {
        Row: {
          id: string;
          nom: string;
          groupe: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          nom: string;
          groupe?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          nom?: string;
          groupe?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      ecoles_campus: {
        Row: {
          id: string;
          ecole_id: string;
          ville: string;
          pays: string;
          eligible_prime: boolean;
          actif: boolean;
        };
        Insert: {
          id?: string;
          ecole_id: string;
          ville: string;
          pays: string;
          eligible_prime?: boolean;
          actif?: boolean;
        };
        Update: {
          id?: string;
          ecole_id?: string;
          ville?: string;
          pays?: string;
          eligible_prime?: boolean;
          actif?: boolean;
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
        | "pending"
        | "attente_ecole"
        | "payable"
        | "paid"
        | "gelee"
        | "annulee"
        | "caduque";
      commission_type:
        | "bonus_dossier"
        | "placement"
        | "bonus_palier"
        | "apport_ecole"
        | "prime_scolarite";
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      commission_statut: ["pending", "paid"],
      commission_type: ["bonus_dossier", "placement", "bonus_palier"],
      lead_statut: ["nouveau", "contacte", "qualifie", "acompte_paye", "place"],
      user_role: ["agent", "commercial", "admin"],
    },
  },
} as const;
