import { ExpenseFormData } from "@/types/expense";
import { supabase } from "./supabase";

export async function getExpenses(userId: string) {
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  return { data, error };
}

export async function addExpense(expense: ExpenseFormData, userId: string, id?: string) {
  const insertData: any = {
    amount: parseFloat(expense.amount),
    category: expense.category,
    date: expense.date.toISOString(),
    notes: expense.notes || null,
    receipt_url: expense.receipt_url || null,
    user_id: userId,
  };

  // If ID is provided (from SQLite), use it
  if (id) {
    insertData.id = id;
  }

  const { data, error } = await supabase
    .from("expenses")
    .insert(insertData)
    .select()
    .single();

  return { data, error };
}

export async function updateExpense(
  id: string,
  updates: Partial<ExpenseFormData>,
) {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.amount !== undefined) {
    updateData.amount = parseFloat(updates.amount);
  }
  if (updates.category !== undefined) {
    updateData.category = updates.category;
  }
  if (updates.date !== undefined) {
    updateData.date = updates.date.toISOString();
  }
  if (updates.notes !== undefined) {
    updateData.notes = updates.notes || null;
  }
  if (updates.receipt_url !== undefined) {
    updateData.receipt_url = updates.receipt_url || null;
  }

  const { data, error } = await supabase
    .from("expenses")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from("expenses").delete().eq("id", id);

  return { error };
}

export async function getCategories() {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  return { data, error };
}
