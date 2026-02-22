export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  month: string; // ISO date string (YYYY-MM-01)
  created_at: string;
  updated_at: string;
}

export interface BudgetFormData {
  category: string;
  amount: string;
  month: Date;
}

export interface BudgetStatus {
  category: string;
  budgetAmount: number;
  actualAmount: number;
  percentageUsed: number;
  remaining: number;
  isOverBudget: boolean;
}

export interface MonthlyBudgetSummary {
  month: string;
  totalBudget: number;
  totalSpent: number;
  percentageUsed: number;
  categories: BudgetStatus[];
}
