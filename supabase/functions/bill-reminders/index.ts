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

  return Response.json({ sent, skipped });
});
