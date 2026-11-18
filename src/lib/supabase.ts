import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    detectSessionInUrl: false,
    persistSession: true,
    autoRefreshToken: true,
  },
});

export async function signInAnonymously(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return;
  await supabase.auth.signInAnonymously();
}
