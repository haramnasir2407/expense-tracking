import { useAuth } from "@/contexts/AuthContext";
import { initDatabase } from "@/lib/db";
import * as expenseService from "@/lib/expenses-sqlite";
import { Expense, ExpenseFormData, GroupedExpenses } from "@/types/expense";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface ExpensesContextType {
  expenses: Expense[];
  groupedExpenses: GroupedExpenses[];
  loading: boolean;
  error: string | null;
  addExpense: (data: ExpenseFormData) => Promise<{ error: string | null }>;
  updateExpense: (
    id: string,
    updates: Partial<ExpenseFormData>,
  ) => Promise<{ error: string | null }>;
  deleteExpense: (id: string) => Promise<{ error: string | null }>;
  refresh: () => Promise<void>;
  getTotalAmount: (period?: "today" | "week" | "month" | "all") => number;
}

const ExpensesContext = createContext<ExpensesContextType | undefined>(
  undefined,
);

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize database on mount
  useEffect(() => {
    try {
      initDatabase();
      console.log('Database initialized');
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }, []);

  // Fetch expenses
  useEffect(() => {
    if (user?.id) {
      loadExpenses();
    } else {
      // Clear expenses when user logs out
      setExpenses([]);
      setLoading(false);
    }
  }, [user?.id]);

  async function loadExpenses() {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await expenseService.getExpenses(
      user.id,
    );

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setExpenses(data || []);
    }

    setLoading(false);
  }

  // Add expense with optimistic update
  async function addExpense(expenseData: ExpenseFormData) {
    if (!user?.id) return { error: "Not authenticated" };

    const tempId = `temp-${Date.now()}`;
    const optimisticExpense: Expense = {
      id: tempId,
      user_id: user.id,
      amount: parseFloat(expenseData.amount),
      category: expenseData.category,
      date: expenseData.date.toISOString(),
      notes: expenseData.notes || undefined,
      receipt_url: expenseData.receipt_url || undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Optimistically add to state
    setExpenses((prev) => [optimisticExpense, ...prev]);

    // Call API
    const { data, error: addError } = await expenseService.addExpense(
      expenseData,
      user.id,
    );

    if (addError) {
      // Rollback on error
      setExpenses((prev) => prev.filter((e) => e.id !== tempId));
      return { error: addError.message };
    }

    // Replace temp with real data
    if (data) {
      setExpenses((prev) => prev.map((e) => (e.id === tempId ? data : e)));
    }

    return { error: null };
  }

  // Update expense
  async function updateExpense(id: string, updates: Partial<ExpenseFormData>) {
    // Optimistically update
    const backup = expenses.find((e) => e.id === id);

    if (backup) {
      const optimisticUpdate: Expense = {
        ...backup,
        amount: updates.amount ? parseFloat(updates.amount) : backup.amount,
        category: updates.category || backup.category,
        date: updates.date ? updates.date.toISOString() : backup.date,
        notes: updates.notes !== undefined ? updates.notes : backup.notes,
        receipt_url:
          updates.receipt_url !== undefined
            ? updates.receipt_url
            : backup.receipt_url,
        updated_at: new Date().toISOString(),
      };

      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? optimisticUpdate : e)),
      );
    }

    const { data, error: updateError } = await expenseService.updateExpense(
      id,
      updates,
    );

    if (updateError) {
      // Rollback on error
      if (backup) {
        setExpenses((prev) => prev.map((e) => (e.id === id ? backup : e)));
      }
      return { error: updateError.message };
    }

    // Update with real data
    if (data) {
      setExpenses((prev) => prev.map((e) => (e.id === id ? data : e)));
    }

    return { error: null };
  }

  // Delete expense
  async function deleteExpense(id: string) {
    // Optimistically remove
    const backup = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    const { error: deleteError } = await expenseService.deleteExpense(id);

    if (deleteError && backup) {
      // Rollback on error
      setExpenses((prev) =>
        [...prev, backup].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      );
      return { error: deleteError.message };
    }

    return { error: null };
  }

  // Group expenses by date
  function getGroupedExpenses(): GroupedExpenses[] {
    const groups: { [key: string]: Expense[] } = {};

    expenses.forEach((expense) => {
      const dateKey = new Date(expense.date).toLocaleDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(expense);
    });

    return Object.entries(groups)
      .map(([date, expenseList]) => ({
        date,
        total: expenseList.reduce((sum, e) => sum + Number(e.amount), 0),
        expenses: expenseList,
      }))
      .sort(
        (a, b) =>
          new Date(b.expenses[0].date).getTime() -
          new Date(a.expenses[0].date).getTime(),
      );
  }

  // Calculate total for a period
  function getTotalAmount(period?: "today" | "week" | "month" | "all"): number {
    const now = new Date();
    let filteredExpenses = expenses;

    if (period === "today") {
      const today = now.toDateString();
      filteredExpenses = expenses.filter(
        (e) => new Date(e.date).toDateString() === today,
      );
    } else if (period === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredExpenses = expenses.filter((e) => new Date(e.date) >= weekAgo);
    } else if (period === "month") {
      const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
      filteredExpenses = expenses.filter((e) => new Date(e.date) >= monthAgo);
    }

    return filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }

  const value: ExpensesContextType = {
    expenses,
    groupedExpenses: getGroupedExpenses(),
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh: loadExpenses,
    getTotalAmount,
  };

  return (
    <ExpensesContext.Provider value={value}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpensesContext);
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpensesProvider");
  }
  return context;
}
