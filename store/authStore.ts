import type { Session } from "@supabase/supabase-js";
import { create } from "zustand";

interface AuthState {
  userId: string | null;
  supabaseSession: Session | null;
  setSession: (userId: string, session: Session | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userId: null,
  supabaseSession: null,
  setSession: (userId, supabaseSession) => set({ userId, supabaseSession }),
  clear: () => set({ userId: null, supabaseSession: null }),
}));
