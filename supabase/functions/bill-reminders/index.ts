import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // bypasses RLS — never shipped in app bundle
);

Deno.serve(async () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().slice(0, 10); // YYYY-MM-DD

  // Fetch all active rules due tomorrow, join profile for push token
  const { data: rules, error } = await supabase
    .from("recurring_rules")
    .select("id, name, amount, user_id, profiles!inner(expo_push_token)")
    .eq("is_active", true)
    .eq("next_due_date", tomorrowStr);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  let sent = 0;
  let skipped = 0;

  const messages = [];
  for (const rule of rules ?? []) {
    const token = (rule.profiles as { expo_push_token: string | null }).expo_push_token;
    if (!token) { skipped++; continue; }

    messages.push({
      to: token,
      title: "Bill Reminder",
      body: `${rule.name} is due tomorrow — ₱${rule.amount}`,
      data: { ruleId: rule.id },
    });
    sent++;
  }

  if (messages.length > 0) {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(messages),
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  const { data: staleRules } = await supabase
    .from("recurring_rules")
    .select("id, recurrence_day, frequency, next_due_date")
    .eq("is_active", true)
    .lte("next_due_date", todayStr);

  for (const rule of staleRules ?? []) {
    let cursor = rule.next_due_date as string;
    while (cursor <= todayStr) {
      const [y, m, d] = cursor.split("-").map(Number);
      const dayAfter = new Date(y, m - 1, d + 1);

      if (rule.frequency === "weekly") {
        const dow = dayAfter.getDay();
        const daysAhead = ((rule.recurrence_day as number) - dow + 7) % 7;
        const nextDate = new Date(dayAfter);
        nextDate.setDate(nextDate.getDate() + daysAhead);
        cursor = nextDate.toISOString().slice(0, 10);
      } else {
        let month = dayAfter.getMonth();
        let year = dayAfter.getFullYear();
        const maxDay = new Date(year, month + 1, 0).getDate();
        const clampedDay = Math.min(rule.recurrence_day as number, maxDay);
        if (clampedDay >= dayAfter.getDate()) {
          cursor = `${year}-${String(month + 1).padStart(2, "0")}-${String(clampedDay).padStart(2, "0")}`;
        } else {
          month++;
          if (month > 11) { month = 0; year++; }
          const nextMax = new Date(year, month + 1, 0).getDate();
          cursor = `${year}-${String(month + 1).padStart(2, "0")}-${String(Math.min(rule.recurrence_day as number, nextMax)).padStart(2, "0")}`;
        }
      }
    }

    await supabase
      .from("recurring_rules")
      .update({ next_due_date: cursor, updated_at: new Date().toISOString() })
      .eq("id", rule.id);
  }

  return Response.json({ sent, skipped, advanced: staleRules?.length ?? 0 });
});
