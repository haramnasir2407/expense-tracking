export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  transactionCount: number;
}

export interface DailySpending {
  date: string; // ISO date string
  amount: number;
}

export interface MonthlySpending {
  month: string; // YYYY-MM
  amount: number;
  transactionCount: number;
}

export interface SpendingTrend {
  current: number;
  previous: number;
  change: number; // Percentage change
  trend: "up" | "down" | "stable";
}

export interface AnalyticsData {
  // Overview
  totalSpent: number;
  averagePerDay: number;
  averagePerTransaction: number;
  transactionCount: number;

  // Breakdowns
  byCategory: CategorySpending[];
  dailyTotals: DailySpending[];
  monthlyTotals: MonthlySpending[];

  // Trends
  monthOverMonthTrend: SpendingTrend;
  topCategory: CategorySpending | null;
}

export interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
}

export type DateRange =
  | "week"
  | "month"
  | "3months"
  | "6months"
  | "year"
  | "all";
