export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

export interface ExpenseFormData {
  amount: string;
  category: string;
  date: Date;
  notes: string;
  receipt_url?: string;
}

export interface GroupedExpenses {
  date: string;
  total: number;
  expenses: Expense[];
}
