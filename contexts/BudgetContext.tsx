import { useExpenses } from "@/hooks/useExpenses";
import * as budgetCalculator from "@/lib/budget-calculator";
import * as budgetService from "@/lib/budgets";
import * as notificationService from "@/lib/notifications";
import { Budget, BudgetFormData, MonthlyBudgetSummary } from "@/types/budget";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";

interface BudgetContextType {
  budgets: Budget[];
  currentMonthSummary: MonthlyBudgetSummary | null;
  loading: boolean;
  error: string | null;
  createBudget: (data: BudgetFormData) => Promise<{ error: string | null }>;
  updateBudget: (
    id: string,
    amount: string,
  ) => Promise<{ error: string | null }>;
  deleteBudget: (id: string) => Promise<{ error: string | null }>;
  getBudgetStatus: (month: Date) => MonthlyBudgetSummary | null;
  refresh: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { expenses } = useExpenses();
  const { settings: notificationSettings } = useNotifications();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [alertedCategories, setAlertedCategories] = useState<Set<string>>(
    new Set(),
  );

  const loadBudgets = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await budgetService.getBudgets(user.id);

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setBudgets(data || []);
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadBudgets();
    } else {
      setBudgets([]);
      setLoading(false);
    }
  }, [user?.id, loadBudgets]);

  const currentMonthSummary = useMemo(() => {
    if (budgets.length === 0) return null;

    const currentMonth = new Date();
    const currentMonthBudgets = budgets.filter((b) => {
      const budgetMonth = new Date(b.month);
      return (
        budgetMonth.getMonth() === currentMonth.getMonth() &&
        budgetMonth.getFullYear() === currentMonth.getFullYear()
      );
    });

    if (currentMonthBudgets.length === 0) return null;

    return budgetCalculator.calculateBudgetStatus(
      currentMonthBudgets,
      expenses,
      currentMonth,
    );
  }, [budgets, expenses]);

  useEffect(() => {
    if (currentMonthSummary && notificationSettings) {
      checkBudgetAlerts();
    }

    // Reset alerted categories when month changes
    if (currentMonthSummary) {
      const currentMonth = currentMonthSummary.month;
      setAlertedCategories((prev) => {
        const filtered = new Set<string>();
        prev.forEach((key) => {
          if (key.startsWith(currentMonth)) {
            filtered.add(key);
          }
        });
        return filtered;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonthSummary, notificationSettings]);

  async function checkBudgetAlerts() {
    if (!currentMonthSummary || !notificationSettings) return;

    // Only check if budget alerts are enabled
    if (!notificationSettings.budget_alerts_enabled) return;

    const threshold = notificationSettings.budget_threshold_percent;
    const monthKey = currentMonthSummary.month;

    for (const categoryStatus of currentMonthSummary.categories) {
      const alertKey = `${monthKey}-${categoryStatus.category}`;

      // Only alert if: 1) above threshold, 2) not already alerted this month
      if (
        categoryStatus.percentageUsed >= threshold &&
        !alertedCategories.has(alertKey)
      ) {
        await notificationService.scheduleBudgetAlert(
          categoryStatus,
          threshold,
        );
        setAlertedCategories((prev) => new Set(prev).add(alertKey));
      }
    }
  }

  async function createBudget(data: BudgetFormData) {
    if (!user?.id) return { error: "Not authenticated" };

    const { data: newBudget, error: createError } =
      await budgetService.createBudget(data, user.id);

    if (createError) {
      return { error: createError.message };
    }

    if (newBudget) {
      setBudgets((prev) => [newBudget, ...prev]);
    }

    return { error: null };
  }

  async function updateBudget(id: string, amount: string) {
    const { data, error: updateError } = await budgetService.updateBudget(
      id,
      amount,
    );

    if (updateError) {
      return { error: updateError.message };
    }

    if (data) {
      setBudgets((prev) => prev.map((b) => (b.id === id ? data : b)));
    }

    return { error: null };
  }

  async function deleteBudget(id: string) {
    const backup = budgets.find((b) => b.id === id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));

    const { error: deleteError } = await budgetService.deleteBudget(id);

    if (deleteError && backup) {
      setBudgets((prev) => [...prev, backup]);
      return { error: deleteError.message };
    }

    return { error: null };
  }

  function getBudgetStatus(month: Date): MonthlyBudgetSummary | null {
    const monthBudgets = budgets.filter((b) => {
      const budgetMonth = new Date(b.month);
      return (
        budgetMonth.getMonth() === month.getMonth() &&
        budgetMonth.getFullYear() === month.getFullYear()
      );
    });

    if (monthBudgets.length === 0) return null;

    return budgetCalculator.calculateBudgetStatus(
      monthBudgets,
      expenses,
      month,
    );
  }

  const value: BudgetContextType = {
    budgets,
    currentMonthSummary,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetStatus,
    refresh: loadBudgets,
  };

  return (
    <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudgets must be used within BudgetProvider");
  }
  return context;
}
