export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      contribution_targets: {
        Row: {
          created_at: string
          id: string
          target_amount: number
          target_month: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_amount: number
          target_month: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          target_amount?: number
          target_month?: string
          updated_at?: string
        }
        Relationships: []
      }
      contributions: {
        Row: {
          amount: number
          contribution_date: string
          created_at: string
          id: string
          member_id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          status: Database["public"]["Enums"]["contribution_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          contribution_date?: string
          created_at?: string
          id?: string
          member_id: string
          notes?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["contribution_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          contribution_date?: string
          created_at?: string
          id?: string
          member_id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          status?: Database["public"]["Enums"]["contribution_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      dividend_declarations: {
        Row: {
          calculation_method: string
          created_at: string
          declaration_date: string
          dividend_per_share: number
          dividend_period_end: string
          dividend_period_start: string
          id: string
          notes: string | null
          status: string
          total_dividend_amount: number
          updated_at: string
        }
        Insert: {
          calculation_method?: string
          created_at?: string
          declaration_date?: string
          dividend_per_share?: number
          dividend_period_end: string
          dividend_period_start: string
          id?: string
          notes?: string | null
          status?: string
          total_dividend_amount?: number
          updated_at?: string
        }
        Update: {
          calculation_method?: string
          created_at?: string
          declaration_date?: string
          dividend_per_share?: number
          dividend_period_end?: string
          dividend_period_start?: string
          id?: string
          notes?: string | null
          status?: string
          total_dividend_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      loan_repayments: {
        Row: {
          amount: number
          created_at: string
          id: string
          loan_id: string
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          loan_id: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          loan_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loan_interest_profits"
            referencedColumns: ["loan_id"]
          },
          {
            foreignKeyName: "loan_repayments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          approved_by: string | null
          created_at: string
          due_date: string
          id: string
          interest_rate: number
          loan_date: string
          member_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          approved_by?: string | null
          created_at?: string
          due_date: string
          id?: string
          interest_rate?: number
          loan_date?: string
          member_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          created_at?: string
          due_date?: string
          id?: string
          interest_rate?: number
          loan_date?: string
          member_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_attendance: {
        Row: {
          attended: boolean
          id: string
          meeting_id: string
          member_id: string
        }
        Insert: {
          attended?: boolean
          id?: string
          meeting_id: string
          member_id: string
        }
        Update: {
          attended?: boolean
          id?: string
          meeting_id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meeting_attendance_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          actual_attendees: number | null
          agenda: string[] | null
          created_at: string
          expected_attendees: number | null
          id: string
          location: string
          meeting_date: string
          meeting_time: string
          minutes: string | null
          status: Database["public"]["Enums"]["meeting_status"]
          title: string
          updated_at: string
        }
        Insert: {
          actual_attendees?: number | null
          agenda?: string[] | null
          created_at?: string
          expected_attendees?: number | null
          id?: string
          location: string
          meeting_date: string
          meeting_time: string
          minutes?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          title: string
          updated_at?: string
        }
        Update: {
          actual_attendees?: number | null
          agenda?: string[] | null
          created_at?: string
          expected_attendees?: number | null
          id?: string
          location?: string
          meeting_date?: string
          meeting_time?: string
          minutes?: string | null
          status?: Database["public"]["Enums"]["meeting_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      member_dividends: {
        Row: {
          contribution_percentage: number
          created_at: string
          dividend_amount: number
          dividend_declaration_id: string
          id: string
          member_contribution_amount: number
          member_id: string
          payment_date: string | null
          payment_method: string | null
          payment_reference: string | null
          payment_status: string
          updated_at: string
        }
        Insert: {
          contribution_percentage?: number
          created_at?: string
          dividend_amount?: number
          dividend_declaration_id: string
          id?: string
          member_contribution_amount?: number
          member_id: string
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          updated_at?: string
        }
        Update: {
          contribution_percentage?: number
          created_at?: string
          dividend_amount?: number
          dividend_declaration_id?: string
          id?: string
          member_contribution_amount?: number
          member_id?: string
          payment_date?: string | null
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "member_dividends_dividend_declaration_id_fkey"
            columns: ["dividend_declaration_id"]
            isOneToOne: false
            referencedRelation: "dividend_declarations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "member_dividends_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          created_at: string
          email: string | null
          id: string
          join_date: string
          name: string
          phone: string
          status: Database["public"]["Enums"]["member_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          join_date?: string
          name: string
          phone: string
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          join_date?: string
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["member_status"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      loan_interest_profits: {
        Row: {
          due_date: string | null
          interest_profit_earned: number | null
          interest_rate: number | null
          loan_date: string | null
          loan_id: string | null
          member_id: string | null
          member_name: string | null
          principal_amount: number | null
          status: string | null
          total_interest_expected: number | null
          total_repaid: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_member_dividends: {
        Args: {
          declaration_id: string
          period_start: string
          period_end: string
          total_dividend: number
        }
        Returns: {
          member_id: string
          member_name: string
          member_contribution: number
          contribution_percentage: number
          dividend_amount: number
        }[]
      }
      get_active_members_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_audit_trail: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          id: string
          action: string
          entity_type: string
          entity_id: string
          old_values: Json
          new_values: Json
          created_at: string
          user_name: string
        }[]
      }
      get_available_loan_fund: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_loan_balance: {
        Args: { loan_uuid: string }
        Returns: number
      }
      get_loan_total_repaid: {
        Args: { loan_uuid: string }
        Returns: number
      }
      get_member_active_loans: {
        Args: { member_uuid: string }
        Returns: {
          id: string
          amount: number
          interest_rate: number
          due_date: string
          loan_date: string
          total_amount: number
          total_repaid: number
          balance: number
          status: string
        }[]
      }
      get_member_dividend_history: {
        Args: { member_uuid: string }
        Returns: {
          declaration_date: string
          dividend_period_start: string
          dividend_period_end: string
          total_dividend_amount: number
          member_contribution: number
          contribution_percentage: number
          dividend_amount: number
          payment_status: string
          payment_date: string
        }[]
      }
      get_member_interest_profit: {
        Args: { member_uuid: string }
        Returns: {
          loan_id: string
          principal_amount: number
          interest_rate: number
          total_interest_expected: number
          interest_profit_earned: number
          loan_date: string
          due_date: string
          status: string
        }[]
      }
      get_member_total_contributions: {
        Args: { member_uuid: string }
        Returns: number
      }
      get_member_total_dividends: {
        Args: { member_uuid: string }
        Returns: number
      }
      get_members_missing_monthly_contributions: {
        Args: Record<PropertyKey, never>
        Returns: {
          member_id: string
          member_name: string
          member_phone: string
          member_email: string
          last_contribution_date: string
          last_contribution_amount: number
          days_since_last_contribution: number
          total_contributions: number
        }[]
      }
      get_monthly_contributions_total: {
        Args: { target_month: string }
        Returns: number
      }
      get_monthly_target: {
        Args: { target_month?: string }
        Returns: number
      }
      get_next_meeting: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          meeting_date: string
          meeting_time: string
          location: string
          days_until: number
        }[]
      }
      get_overdue_loans: {
        Args: Record<PropertyKey, never>
        Returns: {
          loan_id: string
          member_id: string
          member_name: string
          member_phone: string
          loan_amount: number
          total_amount_due: number
          amount_repaid: number
          balance_due: number
          due_date: string
          days_overdue: number
          interest_rate: number
        }[]
      }
      get_overdue_payments_summary: {
        Args: Record<PropertyKey, never>
        Returns: {
          overdue_loans_count: number
          overdue_loans_total_amount: number
          members_missing_contributions_count: number
          total_expected_monthly_target: number
          current_month_collected: number
          collection_percentage: number
        }[]
      }
      get_past_meetings: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          meeting_date: string
          meeting_time: string
          location: string
          actual_attendees: number
          minutes: string
          status: Database["public"]["Enums"]["meeting_status"]
          created_at: string
        }[]
      }
      get_recent_activities: {
        Args: Record<PropertyKey, never>
        Returns: {
          member_name: string
          action: string
          amount: number
          created_at: string
          activity_type: string
        }[]
      }
      get_total_contributions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_total_interest_profit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_upcoming_meetings: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          meeting_date: string
          meeting_time: string
          location: string
          expected_attendees: number
          agenda: string[]
          status: Database["public"]["Enums"]["meeting_status"]
          created_at: string
        }[]
      }
      log_activity: {
        Args: {
          p_action: string
          p_entity_type: string
          p_entity_id?: string
          p_old_values?: Json
          p_new_values?: Json
        }
        Returns: string
      }
      set_monthly_target: {
        Args: { target_month: string; target_amount: number }
        Returns: undefined
      }
      update_overdue_loan_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      contribution_status: "confirmed" | "pending" | "failed"
      meeting_status: "scheduled" | "completed" | "cancelled"
      member_status: "active" | "inactive" | "suspended"
      payment_method: "m_pesa" | "bank_transfer" | "cash"
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
      contribution_status: ["confirmed", "pending", "failed"],
      meeting_status: ["scheduled", "completed", "cancelled"],
      member_status: ["active", "inactive", "suspended"],
      payment_method: ["m_pesa", "bank_transfer", "cash"],
    },
  },
} as const
