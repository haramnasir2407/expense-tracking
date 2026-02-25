import { BudgetFormData } from "@/types/budget";
import { supabase } from "./supabase";

export async function getBudgets(userId: string, month?: Date) {
  let query = supabase
    .from("budgets")
    .select("*")
    .eq("user_id", userId)
    .order("month", { ascending: false });

  if (month) {
    const monthStr = formatMonthStart(month);
    query = query.eq("month", monthStr);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function createBudget(budget: BudgetFormData, userId: string) {
  const { data, error } = await supabase
    .from("budgets")
    .insert({
      user_id: userId,
      category: budget.category,
      amount: parseFloat(budget.amount),
      month: formatMonthStart(budget.month),
    })
    .select()
    .single();

  return { data, error };
}

export async function updateBudget(id: string, amount: string) {
  const { data, error } = await supabase
    .from("budgets")
    .update({
      amount: parseFloat(amount),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function deleteBudget(id: string) {
  const { error } = await supabase.from("budgets").delete().eq("id", id);

  return { error };
}

function formatMonthStart(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}
