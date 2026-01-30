import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wocodvpvpwupaqhptdnf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_yxuUhvmiqgZk_pUecQDDRA_kRwPod7I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Types for focuu database
export type EnergyModeType = "low" | "normal" | "focused";

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_pro: boolean | null;
  subscription_status: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export interface Session {
  id: string;
  user_id: string;
  energy_mode: EnergyModeType;
  intent: string | null;
  duration_minutes: number;
  completed_at: string;
  created_at: string;
}

export interface SavedMode {
  id: string;
  user_id: string;
  name: string;
  energy_mode: EnergyModeType;
  session_length: number;
  break_length: number;
  is_default: boolean;
  created_at: string;
}
