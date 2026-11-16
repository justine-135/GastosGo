import { QueryClientProvider } from "@tanstack/react-query";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { AppState } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { db, migrations } from "../db";
import { queryClient } from "../lib/queryClient";
import { useAuthStore } from "../store/authStore";
import { useThemeStore } from "../store/themeStore";
import { generateId } from "../lib/crypto";
import { usersTable, profilesTable } from "../db/schema";
import { eq, isNull } from "drizzle-orm";
import { supabase } from "../lib/supabase";
import { drainSyncQueue } from "../db/queries/syncQueue";

export default function RootLayout() {
  const { success: migrationsRan, error: migrationError } = useMigrations(db, migrations);
  const { userId, setSession, supabaseSession } = useAuthStore();
  const resolved = useThemeStore((s) => s.resolved);
  const router = useRouter();
  const segments = useSegments();
  const segmentsRef = useRef(segments);
  segmentsRef.current = segments;

  // Bootstrap anonymous auth and local user row
  useEffect(() => {
    if (!migrationsRan) return;

    async function bootstrap() {
      // Get or create an anonymous Supabase session (5 s timeout guards unprovisioned project)
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("supabase_timeout")), 5000)
        );
        const { data, error } = await Promise.race([
          supabase.auth.signInAnonymously(),
          timeout,
        ]);
        if (error) throw error;
        session = data.session;
      }
      const supabaseId = session!.user.id;

      // Find existing local user linked to this Supabase identity
      const bySupaId = await db.select().from(usersTable)
        .where(eq(usersTable.supabaseId, supabaseId))
        .limit(1);
      let localId: string;
      if (bySupaId.length > 0) {
        localId = bySupaId[0].id;
      } else {
        // Migration: link an unlinked local-only user, or create fresh
        const unlinked = await db.select().from(usersTable)
          .where(isNull(usersTable.supabaseId))
          .limit(1);
        if (unlinked.length > 0) {
          localId = unlinked[0].id;
          await db.update(usersTable).set({ supabaseId }).where(eq(usersTable.id, localId));
        } else {
          localId = generateId();
          await db.insert(usersTable).values({ id: localId, supabaseId });
        }
      }
      setSession(localId, session);
      drainSyncQueue(supabaseId).catch((e) => console.warn("[sync]", e));
    }

    bootstrap().catch((e) => {
      // Timeout or network failure — userId stays null, guard redirects to onboarding
      if (e?.message !== "supabase_timeout") console.warn("[bootstrap]", e);
    });
  }, [migrationsRan]);

  // Drain queue when app comes back to foreground
  useEffect(() => {
    if (!supabaseSession) return;
    const uid = supabaseSession.user.id;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") drainSyncQueue(uid).catch((e) => console.warn("[sync]", e));
    });
    return () => sub.remove();
  }, [supabaseSession]);

  // If migrations ran but auth isn't ready yet, go to onboarding immediately.
  // Handles Supabase failure / slow network — avoids hanging on (tabs) forever.
  useEffect(() => {
    if (!migrationsRan || userId) return;
    const inOnboarding = segments[0] === "(onboarding)";
    if (!inOnboarding) router.replace("/(onboarding)");
  }, [migrationsRan, userId]);

  // Once auth resolves, do a profile-based redirect.
  useEffect(() => {
    if (!userId) return;

    async function checkProfile() {
      const profile = await db.select().from(profilesTable)
        .where(eq(profilesTable.userId, userId!))
        .limit(1);

      const inOnboarding = segmentsRef.current[0] === "(onboarding)";
      const hasProfile = profile.length > 0;

      if (!hasProfile && !inOnboarding) {
        router.replace("/(onboarding)");
      } else if (hasProfile && inOnboarding) {
        router.replace("/(tabs)");
      }
    }

    checkProfile();
  }, [userId]);

  if (migrationError) throw migrationError;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
