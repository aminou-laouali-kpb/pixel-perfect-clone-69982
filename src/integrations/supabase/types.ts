export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          code_parrainage: string
          created_at: string
          email: string
          id: string
          motivation: string | null
          niveau_etudes: string
          nom: string
          parrain_id: string | null
          pays: string
          placements_count: number
          quiz_passed_at: string | null
          quiz_retry_at: string | null
          quiz_score: number | null
          statut: Database["public"]["Enums"]["agent_statut"]
          tier: Database["public"]["Enums"]["agent_tier"]
          whatsapp: string
        }
        Insert: {
          code_parrainage: string
          created_at?: string
          email: string
          id: string
          motivation?: string | null
          niveau_etudes: string
          nom: string
          parrain_id?: string | null
          pays: string
          placements_count?: number
          quiz_passed_at?: string | null
          quiz_retry_at?: string | null
          quiz_score?: number | null
          statut?: Database["public"]["Enums"]["agent_statut"]
          tier?: Database["public"]["Enums"]["agent_tier"]
          whatsapp: string
        }
        Update: {
          code_parrainage?: string
          created_at?: string
          email?: string
          id?: string
          motivation?: string | null
          niveau_etudes?: string
          nom?: string
          parrain_id?: string | null
          pays?: string
          placements_count?: number
          quiz_passed_at?: string | null
          quiz_retry_at?: string | null
          quiz_score?: number | null
          statut?: Database["public"]["Enums"]["agent_statut"]
          tier?: Database["public"]["Enums"]["agent_tier"]
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_parrain_id_fkey"
            columns: ["parrain_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          lead_id: string | null
          montant: number
          statut: Database["public"]["Enums"]["commission_statut"]
          type: Database["public"]["Enums"]["commission_type"]
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          lead_id?: string | null
          montant: number
          statut?: Database["public"]["Enums"]["commission_statut"]
          type: Database["public"]["Enums"]["commission_type"]
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          lead_id?: string | null
          montant?: number
          statut?: Database["public"]["Enums"]["commission_statut"]
          type?: Database["public"]["Enums"]["commission_type"]
        }
        Relationships: [
          {
            foreignKeyName: "commissions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          agent_id: string
          assigned_to: string
          bonus_paid: boolean
          commission_amount: number
          created_at: string
          destination: string
          email: string | null
          id: string
          montant_service: number | null
          nom: string
          notes: string | null
          pays: string
          statut: Database["public"]["Enums"]["lead_statut"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          agent_id: string
          assigned_to: string
          bonus_paid?: boolean
          commission_amount?: number
          created_at?: string
          destination: string
          email?: string | null
          id?: string
          montant_service?: number | null
          nom: string
          notes?: string | null
          pays: string
          statut?: Database["public"]["Enums"]["lead_statut"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          agent_id?: string
          assigned_to?: string
          bonus_paid?: boolean
          commission_amount?: number
          created_at?: string
          destination?: string
          email?: string | null
          id?: string
          montant_service?: number | null
          nom?: string
          notes?: string | null
          pays?: string
          statut?: Database["public"]["Enums"]["lead_statut"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nom: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          nom: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nom?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      rr_state: {
        Row: {
          commercial: string
          email: string
          id: number
          leads_total: number
          rr_index: number
          whatsapp: string
        }
        Insert: {
          commercial: string
          email: string
          id?: number
          leads_total?: number
          rr_index?: number
          whatsapp: string
        }
        Update: {
          commercial?: string
          email?: string
          id?: number
          leads_total?: number
          rr_index?: number
          whatsapp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_lead_round_robin: { Args: { p_lead_id: string }; Returns: string }
      create_placement_commission: {
        Args: { p_lead_id: string }
        Returns: undefined
      }
      current_commercial_name: { Args: never; Returns: string }
      current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_agent_rank: { Args: never; Returns: number }
      get_leaderboard: {
        Args: { p_end: string; p_limit?: number; p_start: string }
        Returns: {
          placements: number
          prenom: string
          rang: number
        }[]
      }
      list_agents_basic: {
        Args: never
        Returns: {
          id: string
          nom: string
        }[]
      }
      list_rr_state_basic: {
        Args: never
        Returns: {
          commercial: string
          id: number
          leads_total: number
        }[]
      }
      list_users_for_admin: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          nom: string
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      set_user_role: {
        Args: {
          p_role: Database["public"]["Enums"]["user_role"]
          p_user_id: string
        }
        Returns: undefined
      }
      submit_quiz_attempt: { Args: { p_answers: number[] }; Returns: Json }
      submit_referral_lead: {
        Args: {
          p_code: string
          p_destination?: string
          p_email?: string
          p_nom: string
          p_notes?: string
          p_pays?: string
          p_whatsapp: string
        }
        Returns: Json
      }
    }
    Enums: {
      agent_statut: "quiz_pending" | "quiz_failed" | "essai" | "officiel"
      agent_tier: "bronze" | "argent" | "elite"
      commission_statut: "pending" | "paid"
      commission_type: "bonus_dossier" | "placement" | "bonus_palier"
      lead_statut:
        | "nouveau"
        | "contacte"
        | "qualifie"
        | "acompte_paye"
        | "place"
      user_role: "agent" | "commercial" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

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
} as const
