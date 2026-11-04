import { supabase } from "./supabase";

/**
 * Creates an anonymous session on first launch, or reuses the persisted one.
 * Safe to call multiple times — no-op if a session already exists.
 */
export async function signInAnonymously() {
  const { data: existing } = await supabase.auth.getSession();
  if (existing.session) return existing.session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return data.session;
}

/**
 * Upgrades an anonymous account to a full email/password account.
 * Call when the user opts in to account persistence.
 */
export async function upgradeAccount(email: string, password: string) {
  const { data, error } = await supabase.auth.updateUser({ email, password });
  if (error) throw error;
  return data.user;
}
