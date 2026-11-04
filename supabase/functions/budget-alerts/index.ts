import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // bypasses RLS — service only, never in app bundle
);

const THRESHOLDS = [80, 100] as const;

Deno.serve(async (req) => {
  const { userId, month, year } = await req.json() as {
    userId: string;
    month: number;
    year: number;
  };

  if (!userId || !month || !year) {
    return Response.json({ error: "userId, month, year required" }, { status: 400 });
  }

  // Pull categories with budgets for this user
  const { data: categories, error: catErr } = await supabase
    .from("categories")
    .select("id, name, monthly_budget")
    .eq("user_id", userId)
    .gt("monthly_budget", 0);

  if (catErr) return Response.json({ error: catErr.message }, { status: 500 });

  // Pull expenses for this user/month/year
  const monthStr = String(month).padStart(2, "0");
  const prefix = `${year}-${monthStr}`;

  const { data: expenses, error: expErr } = await supabase
    .from("expenses")
    .select("category_id, amount")
    .eq("user_id", userId)
    .like("date", `${prefix}%`);

  if (expErr) return Response.json({ error: expErr.message }, { status: 500 });

  // Aggregate spend per category
  const spent: Record<string, number> = {};
  for (const e of expenses ?? []) {
    if (!e.category_id) continue;
    spent[e.category_id] = (spent[e.category_id] ?? 0) + Number(e.amount);
  }

  // Pull push token from profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("expo_push_token")
    .eq("user_id", userId)
    .single();

  const pushToken = profile?.expo_push_token as string | null;

  let alertsSent = 0;

  for (const cat of categories ?? []) {
    const pct = cat.monthly_budget > 0
      ? (spent[cat.id] ?? 0) / cat.monthly_budget * 100
      : 0;

    for (const threshold of THRESHOLDS) {
      if (pct < threshold) continue;

      // Insert into budget_alerts_sent; unique constraint prevents duplicates
      const { error: insertErr } = await supabase.from("budget_alerts_sent").insert({
        user_id: userId,
        category_id: cat.id,
        threshold,
        month,
        year,
      });

      // unique_violation means we already sent this alert this month — skip
      if (insertErr) continue;

      if (pushToken) {
        await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: pushToken,
            title: "Budget Alert",
            body: `${cat.name} is at ${threshold}% of your monthly budget`,
            data: { categoryId: cat.id, threshold },
          }),
        });
      }

      alertsSent++;
    }
  }

  return Response.json({ alertsSent });
});
