# Phase 2 Implementation Plan: Analytics, Budgets & Engagement

## Overview

Phase 2 builds on the expense tracking foundation to provide:

- **Analytics & Insights**: Visual spending patterns and trends
- **Budget Management**: Set and track monthly category budgets
- **Smart Notifications**: Reminders and overspending alerts

---

## 1. Architecture & Design Decisions

### 1.1 Charting Library Selection

**Chosen: Victory Native XL**

**Justification:**

- ✅ **React Native Native**: Built specifically for React Native (no web bridge)
- ✅ **Performance**: Uses Skia for hardware-accelerated rendering
- ✅ **Gestures**: Built-in pan, zoom, and press interactions with Reanimated
- ✅ **Bundle Size**: Smaller than alternatives (~200KB vs 500KB+ for others)
- ✅ **Accessibility**: Good a11y support out of the box
- ✅ **TypeScript**: Full type safety

**Alternatives Considered:**

- **React Native Chart Kit**: Simpler but less performant, limited customization
- **Recharts**: Web-focused, poor mobile performance
- **react-native-svg-charts**: Deprecated, no longer maintained

**Installation:**

```bash
npm install victory-native
```

### 1.2 Data Aggregation Strategy

**Problem:** Calculating analytics for thousands of expenses is expensive.

**Solution: Client-side aggregation with memoization**

```typescript
// Aggregate data in ExpensesContext using useMemo
const analyticsData = useMemo(() => {
  return {
    byCategory: aggregateByCategory(expenses),
    byMonth: aggregateByMonth(expenses),
    dailyTotals: aggregateDailyTotals(expenses, 30), // Last 30 days
  };
}, [expenses]);
```

**Why not server-side?**

- Our expense count is manageable (<10k per user typically)
- Client-side is faster (no network round trip)
- Works offline
- Simpler architecture (no new API endpoints)

**When to move to server-side:**

- If users have >10k expenses
- If we add multi-year trend analysis
- If we implement real-time budget alerts across devices

### 1.3 Performance Strategy

1. **Memoization**
   - Use `useMemo` for expensive aggregations
   - Memo-ize chart components with `React.memo`
   - Cache aggregated data in context

2. **Lazy Loading**
   - Load analytics tab only when user visits it
   - Progressive chart rendering (skeleton → data)

3. **Efficient Filtering**
   - Pre-aggregate data by month/category
   - Filter aggregated data, not raw expenses

4. **Chart Optimization**
   - Limit data points (max 30-60 for line charts)
   - Use sampling for large datasets
   - Virtualize legend items if >20 categories

### 1.4 Empty State Handling

**Scenarios:**

1. **No expenses**: Show onboarding with "Add your first expense"
2. **Partial data**: Show available charts, indicate missing data
3. **Single expense**: Show basic stats, disable trend charts
4. **Filtered to empty**: Clear messaging, suggest broadening filters

---

## 2. Database Schema Changes

### 2.1 New Tables

```sql
-- Monthly budgets per category
create table budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  amount decimal(10,2) not null check (amount > 0),
  month date not null, -- First day of month (e.g., 2026-02-01)
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Unique constraint: one budget per user/category/month
  unique (user_id, category, month)
);

-- Enable RLS
alter table budgets enable row level security;

-- Policies
create policy "Users can view own budgets"
  on budgets for select
  using (auth.uid() = user_id);

create policy "Users can insert own budgets"
  on budgets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own budgets"
  on budgets for update
  using (auth.uid() = user_id);

create policy "Users can delete own budgets"
  on budgets for delete
  using (auth.uid() = user_id);

-- Index for faster queries
create index budgets_user_id_month_idx on budgets(user_id, month desc);

-- Notification preferences
create table notification_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  budget_alerts_enabled boolean default true,
  budget_threshold_percent integer default 80 check (budget_threshold_percent between 0 and 100),
  daily_reminder_enabled boolean default false,
  daily_reminder_time time default '20:00:00', -- 8 PM
  weekly_summary_enabled boolean default true,
  weekly_summary_day integer default 0 check (weekly_summary_day between 0 and 6), -- 0 = Sunday
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table notification_settings enable row level security;

-- Policies
create policy "Users can view own notification settings"
  on notification_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own notification settings"
  on notification_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notification settings"
  on notification_settings for update
  using (auth.uid() = user_id);
```

### 2.2 Database Functions (Optional for future server-side aggregation)

```sql
-- Function to calculate budget vs actual for current month
create or replace function get_budget_status(p_user_id uuid, p_month date)
returns table (
  category text,
  budget_amount decimal,
  actual_amount decimal,
  percentage_used integer
) as $$
begin
  return query
  select
    b.category,
    b.amount as budget_amount,
    coalesce(sum(e.amount), 0) as actual_amount,
    coalesce((sum(e.amount) / b.amount * 100)::integer, 0) as percentage_used
  from budgets b
  left join expenses e on
    e.user_id = b.user_id
    and e.category = b.category
    and date_trunc('month', e.date) = p_month
  where b.user_id = p_user_id
    and b.month = p_month
  group by b.id, b.category, b.amount;
end;
$$ language plpgsql security definer;
```

---

## 3. Type Definitions

### 3.1 Budget Types

Create `types/budget.ts`:

```typescript
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
```

### 3.2 Analytics Types

Create `types/analytics.ts`:

```typescript
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
```

### 3.3 Notification Types

Create `types/notification.ts`:

```typescript
export interface NotificationSettings {
  id: string;
  user_id: string;
  budget_alerts_enabled: boolean;
  budget_threshold_percent: number;
  daily_reminder_enabled: boolean;
  daily_reminder_time: string; // HH:MM:SS
  weekly_summary_enabled: boolean;
  weekly_summary_day: number; // 0-6 (Sun-Sat)
  created_at: string;
  updated_at: string;
}

export type NotificationType =
  | "budget_warning" // 80% of budget reached
  | "budget_exceeded" // 100% of budget exceeded
  | "daily_reminder" // Daily reminder to log expenses
  | "weekly_summary"; // Weekly spending summary

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}
```

---

## 4. Service Layer Implementation

### 4.1 Budget Service

Create `lib/budgets.ts`:

```typescript
import { supabase } from "./supabase";
import { Budget, BudgetFormData, BudgetStatus } from "@/types/budget";

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

// Helper to format date to first day of month
function formatMonthStart(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}
```

### 4.2 Analytics Service

Create `lib/analytics.ts`:

```typescript
import { Expense } from "@/types/expense";
import {
  AnalyticsData,
  CategorySpending,
  DailySpending,
  MonthlySpending,
  SpendingTrend,
  DateRange,
} from "@/types/analytics";
import { CATEGORY_COLORS } from "@/constants/categories";

export function calculateAnalytics(
  expenses: Expense[],
  dateRange?: DateRange,
): AnalyticsData {
  const filteredExpenses = filterByDateRange(expenses, dateRange);

  if (filteredExpenses.length === 0) {
    return getEmptyAnalytics();
  }

  return {
    totalSpent: calculateTotalSpent(filteredExpenses),
    averagePerDay: calculateAveragePerDay(filteredExpenses, dateRange),
    averagePerTransaction: calculateAveragePerTransaction(filteredExpenses),
    transactionCount: filteredExpenses.length,
    byCategory: aggregateByCategory(filteredExpenses),
    dailyTotals: aggregateByDay(filteredExpenses),
    monthlyTotals: aggregateByMonth(filteredExpenses),
    monthOverMonthTrend: calculateMonthOverMonthTrend(expenses),
    topCategory: getTopCategory(filteredExpenses),
  };
}

function filterByDateRange(expenses: Expense[], range?: DateRange): Expense[] {
  if (!range || range === "all") return expenses;

  const now = new Date();
  const cutoffDate = new Date();

  switch (range) {
    case "week":
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case "month":
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case "3months":
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case "6months":
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case "year":
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return expenses.filter((e) => new Date(e.date) >= cutoffDate);
}

function calculateTotalSpent(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

function calculateAveragePerDay(
  expenses: Expense[],
  range?: DateRange,
): number {
  if (expenses.length === 0) return 0;

  const total = calculateTotalSpent(expenses);
  const days = getDaysInRange(range);

  return total / days;
}

function calculateAveragePerTransaction(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  return calculateTotalSpent(expenses) / expenses.length;
}

function aggregateByCategory(expenses: Expense[]): CategorySpending[] {
  const categoryMap = new Map<string, { amount: number; count: number }>();
  const total = calculateTotalSpent(expenses);

  expenses.forEach((expense) => {
    const current = categoryMap.get(expense.category) || {
      amount: 0,
      count: 0,
    };
    categoryMap.set(expense.category, {
      amount: current.amount + Number(expense.amount),
      count: current.count + 1,
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, { amount, count }]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: CATEGORY_COLORS[category] || "#999999",
      transactionCount: count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function aggregateByDay(expenses: Expense[]): DailySpending[] {
  const dayMap = new Map<string, number>();

  expenses.forEach((expense) => {
    const date = new Date(expense.date).toISOString().split("T")[0];
    const current = dayMap.get(date) || 0;
    dayMap.set(date, current + Number(expense.amount));
  });

  return Array.from(dayMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function aggregateByMonth(expenses: Expense[]): MonthlySpending[] {
  const monthMap = new Map<string, { amount: number; count: number }>();

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = monthMap.get(month) || { amount: 0, count: 0 };
    monthMap.set(month, {
      amount: current.amount + Number(expense.amount),
      count: current.count + 1,
    });
  });

  return Array.from(monthMap.entries())
    .map(([month, { amount, count }]) => ({
      month,
      amount,
      transactionCount: count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function calculateMonthOverMonthTrend(expenses: Expense[]): SpendingTrend {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const previousExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const current = calculateTotalSpent(currentExpenses);
  const previous = calculateTotalSpent(previousExpenses);
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  return {
    current,
    previous,
    change,
    trend: change > 5 ? "up" : change < -5 ? "down" : "stable",
  };
}

function getTopCategory(expenses: Expense[]): CategorySpending | null {
  const byCategory = aggregateByCategory(expenses);
  return byCategory.length > 0 ? byCategory[0] : null;
}

function getDaysInRange(range?: DateRange): number {
  switch (range) {
    case "week":
      return 7;
    case "month":
      return 30;
    case "3months":
      return 90;
    case "6months":
      return 180;
    case "year":
      return 365;
    default:
      return 30; // Default to month
  }
}

function getEmptyAnalytics(): AnalyticsData {
  return {
    totalSpent: 0,
    averagePerDay: 0,
    averagePerTransaction: 0,
    transactionCount: 0,
    byCategory: [],
    dailyTotals: [],
    monthlyTotals: [],
    monthOverMonthTrend: {
      current: 0,
      previous: 0,
      change: 0,
      trend: "stable",
    },
    topCategory: null,
  };
}
```

### 4.3 Budget Calculator Service

Create `lib/budget-calculator.ts`:

```typescript
import { Expense } from "@/types/expense";
import { Budget, BudgetStatus, MonthlyBudgetSummary } from "@/types/budget";

export function calculateBudgetStatus(
  budgets: Budget[],
  expenses: Expense[],
  month: Date,
): MonthlyBudgetSummary {
  const monthStr = formatMonthKey(month);

  // Filter expenses for the target month
  const monthExpenses = expenses.filter((e) => {
    const expenseMonth = formatMonthKey(new Date(e.date));
    return expenseMonth === monthStr;
  });

  // Calculate status for each budget
  const categoryStatuses: BudgetStatus[] = budgets.map((budget) => {
    const categoryExpenses = monthExpenses.filter(
      (e) => e.category === budget.category,
    );

    const actualAmount = categoryExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const percentageUsed =
      budget.amount > 0 ? Math.round((actualAmount / budget.amount) * 100) : 0;

    return {
      category: budget.category,
      budgetAmount: budget.amount,
      actualAmount,
      percentageUsed,
      remaining: budget.amount - actualAmount,
      isOverBudget: actualAmount > budget.amount,
    };
  });

  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = categoryStatuses.reduce(
    (sum, s) => sum + s.actualAmount,
    0,
  );
  const percentageUsed =
    totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  return {
    month: monthStr,
    totalBudget,
    totalSpent,
    percentageUsed,
    categories: categoryStatuses.sort(
      (a, b) => b.percentageUsed - a.percentageUsed,
    ),
  };
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
```

### 4.4 Notification Service

Create `lib/notifications.ts`:

```typescript
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { BudgetStatus } from "@/types/budget";
import { NotificationType, NotificationPayload } from "@/types/notification";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

export async function scheduleBudgetAlert(
  budgetStatus: BudgetStatus,
  threshold: number,
) {
  if (budgetStatus.percentageUsed < threshold) return;

  const type: NotificationType = budgetStatus.isOverBudget
    ? "budget_exceeded"
    : "budget_warning";

  const payload: NotificationPayload = {
    type,
    title: budgetStatus.isOverBudget
      ? `Budget Exceeded: ${budgetStatus.category}`
      : `Budget Alert: ${budgetStatus.category}`,
    body: budgetStatus.isOverBudget
      ? `You've spent $${budgetStatus.actualAmount.toFixed(2)} of your $${budgetStatus.budgetAmount.toFixed(2)} budget.`
      : `You've used ${budgetStatus.percentageUsed}% of your ${budgetStatus.category} budget.`,
    data: { category: budgetStatus.category },
  };

  await Notifications.scheduleNotificationAsync({
    content: {
      title: payload.title,
      body: payload.body,
      data: payload.data,
    },
    trigger: null, // Send immediately
  });
}

export async function scheduleDailyReminder(time: string) {
  // Parse time (HH:MM:SS)
  const [hour, minute] = time.split(":").map(Number);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Expense Reminder",
      body: "Don't forget to log today's expenses!",
    },
    trigger: {
      hour,
      minute,
      repeats: true,
    },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
```

---

## 5. Context Layer

### 5.1 Budget Context

Create `contexts/BudgetContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useExpenses } from './ExpensesContext';
import * as budgetService from '@/lib/budgets';
import * as budgetCalculator from '@/lib/budget-calculator';
import { Budget, BudgetFormData, MonthlyBudgetSummary } from '@/types/budget';

interface BudgetContextType {
  budgets: Budget[];
  currentMonthSummary: MonthlyBudgetSummary | null;
  loading: boolean;
  error: string | null;
  createBudget: (data: BudgetFormData) => Promise<{ error: string | null }>;
  updateBudget: (id: string, amount: string) => Promise<{ error: string | null }>;
  deleteBudget: (id: string) => Promise<{ error: string | null }>;
  getBudgetStatus: (month: Date) => MonthlyBudgetSummary | null;
  refresh: () => Promise<void>;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { expenses } = useExpenses();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load budgets when user changes
  useEffect(() => {
    if (user?.id) {
      loadBudgets();
    } else {
      setBudgets([]);
      setLoading(false);
    }
  }, [user?.id]);

  async function loadBudgets() {
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
  }

  // Calculate current month summary
  const currentMonthSummary = useMemo(() => {
    if (budgets.length === 0) return null;

    const currentMonth = new Date();
    const currentMonthBudgets = budgets.filter(b => {
      const budgetMonth = new Date(b.month);
      return budgetMonth.getMonth() === currentMonth.getMonth() &&
             budgetMonth.getFullYear() === currentMonth.getFullYear();
    });

    if (currentMonthBudgets.length === 0) return null;

    return budgetCalculator.calculateBudgetStatus(
      currentMonthBudgets,
      expenses,
      currentMonth
    );
  }, [budgets, expenses]);

  async function createBudget(data: BudgetFormData) {
    if (!user?.id) return { error: 'Not authenticated' };

    const { data: newBudget, error: createError } = await budgetService.createBudget(
      data,
      user.id
    );

    if (createError) {
      return { error: createError.message };
    }

    if (newBudget) {
      setBudgets(prev => [newBudget, ...prev]);
    }

    return { error: null };
  }

  async function updateBudget(id: string, amount: string) {
    const { data, error: updateError } = await budgetService.updateBudget(id, amount);

    if (updateError) {
      return { error: updateError.message };
    }

    if (data) {
      setBudgets(prev => prev.map(b => b.id === id ? data : b));
    }

    return { error: null };
  }

  async function deleteBudget(id: string) {
    const backup = budgets.find(b => b.id === id);
    setBudgets(prev => prev.filter(b => b.id !== id));

    const { error: deleteError } = await budgetService.deleteBudget(id);

    if (deleteError && backup) {
      setBudgets(prev => [...prev, backup]);
      return { error: deleteError.message };
    }

    return { error: null };
  }

  function getBudgetStatus(month: Date): MonthlyBudgetSummary | null {
    const monthBudgets = budgets.filter(b => {
      const budgetMonth = new Date(b.month);
      return budgetMonth.getMonth() === month.getMonth() &&
             budgetMonth.getFullYear() === month.getFullYear();
    });

    if (monthBudgets.length === 0) return null;

    return budgetCalculator.calculateBudgetStatus(monthBudgets, expenses, month);
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
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgets() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudgets must be used within BudgetProvider');
  }
  return context;
}
```

### 5.2 Update ExpensesContext

Add analytics calculation to `contexts/ExpensesContext.tsx`:

```typescript
// Add to imports
import { calculateAnalytics } from "@/lib/analytics";
import { AnalyticsData, DateRange } from "@/types/analytics";

// Add to interface
interface ExpensesContextType {
  // ... existing properties
  analytics: AnalyticsData;
  getAnalytics: (dateRange?: DateRange) => AnalyticsData;
}

// Add to provider (using useMemo for performance)
const analytics = useMemo(() => {
  return calculateAnalytics(expenses, "month");
}, [expenses]);

const getAnalytics = useCallback(
  (dateRange?: DateRange) => {
    return calculateAnalytics(expenses, dateRange);
  },
  [expenses],
);

// Add to value object
const value: ExpensesContextType = {
  // ... existing properties
  analytics,
  getAnalytics,
};
```

---

## 6. UI Components

### 6.1 Chart Components

Create `components/analytics/LineChart.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CartesianChart, Line, useChartPressState } from 'victory-native';
import { Circle, useFont } from '@shopify/react-native-skia';
import { DailySpending } from '@/types/analytics';

interface LineChartProps {
  data: DailySpending[];
  height?: number;
}

export function SpendingLineChart({ data, height = 200 }: LineChartProps) {
  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } });

  // Transform data for Victory Native
  const chartData = data.map(d => ({
    x: new Date(d.date).getTime(),
    y: d.amount,
  }));

  if (data.length === 0) {
    return <EmptyChartState message="No spending data to display" />;
  }

  return (
    <View style={[styles.container, { height }]}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={["y"]}
        domainPadding={{ left: 20, right: 20, top: 20 }}
        chartPressState={state}
      >
        {({ points, chartBounds }) => (
          <>
            <Line
              points={points.y}
              color="#4ECDC4"
              strokeWidth={3}
              curveType="catmullRom"
              animate={{ type: "timing", duration: 300 }}
            />
            {isActive && (
              <Circle
                cx={state.x.position}
                cy={state.y.y.position}
                r={5}
                color="#4ECDC4"
              />
            )}
          </>
        )}
      </CartesianChart>

      {isActive && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>
            ${state.y.y.value.value.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tooltip: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 4,
  },
  tooltipText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
```

Create `components/analytics/PieChart.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Pie } from 'victory-native';
import { CategorySpending } from '@/types/analytics';

interface PieChartProps {
  data: CategorySpending[];
  size?: number;
}

export function CategoryPieChart({ data, size = 200 }: PieChartProps) {
  if (data.length === 0) {
    return <EmptyChartState message="No category data to display" />;
  }

  const chartData = data.map(d => ({
    value: d.amount,
    color: d.color,
    label: d.category,
  }));

  return (
    <View style={styles.container}>
      <Pie
        data={chartData}
        width={size}
        height={size}
        innerRadius={size * 0.4} // Donut chart
        animate={{ type: "timing", duration: 300 }}
      />

      <View style={styles.legend}>
        {data.slice(0, 5).map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendLabel}>
              {item.category}: ${item.amount.toFixed(0)} ({item.percentage.toFixed(0)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  legend: {
    marginTop: 20,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#333',
  },
});
```

Create `components/analytics/BarChart.tsx`:

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CartesianChart, Bar } from 'victory-native';
import { MonthlySpending } from '@/types/analytics';

interface BarChartProps {
  data: MonthlySpending[];
  height?: number;
}

export function MonthlyBarChart({ data, height = 200 }: BarChartProps) {
  if (data.length === 0) {
    return <EmptyChartState message="No monthly data to display" />;
  }

  // Format data for chart
  const chartData = data.map((d, index) => ({
    x: index,
    y: d.amount,
    label: formatMonthLabel(d.month),
  }));

  return (
    <View style={[styles.container, { height }]}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={["y"]}
        domainPadding={{ left: 20, right: 20, top: 20 }}
      >
        {({ points, chartBounds }) => (
          <Bar
            points={points.y}
            chartBounds={chartBounds}
            color="#95E1D3"
            roundedCorners={{ topLeft: 5, topRight: 5 }}
            animate={{ type: "timing", duration: 300 }}
          />
        )}
      </CartesianChart>
    </View>
  );
}

function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
```

### 6.2 Budget Components

Create `components/budgets/BudgetCard.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BudgetStatus } from '@/types/budget';
import { Ionicons } from '@expo/vector-icons';

interface BudgetCardProps {
  budget: BudgetStatus;
  onPress?: () => void;
}

export function BudgetCard({ budget, onPress }: BudgetCardProps) {
  const getStatusColor = () => {
    if (budget.isOverBudget) return '#FF6B6B';
    if (budget.percentageUsed >= 80) return '#F39C12';
    return '#4ECDC4';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.category}>{budget.category}</Text>
        <Text style={[styles.percentage, { color: getStatusColor() }]}>
          {budget.percentageUsed}%
        </Text>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(budget.percentageUsed, 100)}%`,
              backgroundColor: getStatusColor(),
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.amount}>
          ${budget.actualAmount.toFixed(2)} of ${budget.budgetAmount.toFixed(2)}
        </Text>
        <Text style={[styles.remaining, { color: getStatusColor() }]}>
          {budget.isOverBudget ? 'Over' : 'Remaining'}: $
          {Math.abs(budget.remaining).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  percentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amount: {
    fontSize: 14,
    color: '#666',
  },
  remaining: {
    fontSize: 14,
    fontWeight: '600',
  },
});
```

Create `components/budgets/BudgetForm.tsx`:

```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { CategoryPicker } from '../expenses/CategoryPicker';
import { BudgetFormData } from '@/types/budget';

interface BudgetFormProps {
  initialData?: Partial<BudgetFormData>;
  onSubmit: (data: BudgetFormData) => Promise<void>;
  onCancel: () => void;
}

export function BudgetForm({ initialData, onSubmit, onCancel }: BudgetFormProps) {
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [month, setMonth] = useState(initialData?.month || new Date());
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !category) return;

    setLoading(true);
    try {
      await onSubmit({ amount, category, month });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Category</Text>
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowCategoryPicker(true)}
      >
        <Text style={category ? styles.inputText : styles.placeholder}>
          {category || 'Select Category'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.label}>Monthly Budget</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading || !amount || !category}
        >
          <Text style={styles.submitText}>Save</Text>
        </TouchableOpacity>
      </View>

      <CategoryPicker
        visible={showCategoryPicker}
        selectedCategory={category}
        onSelect={(cat) => {
          setCategory(cat);
          setShowCategoryPicker(false);
        }}
        onClose={() => setShowCategoryPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputText: {
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  submitButton: {
    backgroundColor: '#4ECDC4',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### 6.3 Empty State Component

Create `components/analytics/EmptyChartState.tsx`:

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyChartStateProps {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyChartState({
  message,
  icon = 'bar-chart-outline'
}: EmptyChartStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color="#ccc" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
```

---

## 7. Screen Implementation

### 7.1 Analytics Tab

Create `app/(tabs)/analytics.tsx`:

```typescript
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useExpenses } from '@/contexts/ExpensesContext';
import { SpendingLineChart } from '@/components/analytics/LineChart';
import { CategoryPieChart } from '@/components/analytics/PieChart';
import { MonthlyBarChart } from '@/components/analytics/BarChart';
import { DateRange } from '@/types/analytics';

const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: '3 Months', value: '3months' },
  { label: '6 Months', value: '6months' },
  { label: 'Year', value: 'year' },
  { label: 'All', value: 'all' },
];

export default function AnalyticsScreen() {
  const { getAnalytics } = useExpenses();
  const [selectedRange, setSelectedRange] = useState<DateRange>('month');

  const analytics = useMemo(() => {
    return getAnalytics(selectedRange);
  }, [getAnalytics, selectedRange]);

  return (
    <ScrollView style={styles.container}>
      {/* Date Range Picker */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.rangeSelector}
        contentContainerStyle={styles.rangeSelectorContent}
      >
        {DATE_RANGES.map((range) => (
          <TouchableOpacity
            key={range.value}
            style={[
              styles.rangeButton,
              selectedRange === range.value && styles.rangeButtonActive,
            ]}
            onPress={() => setSelectedRange(range.value)}
          >
            <Text
              style={[
                styles.rangeButtonText,
                selectedRange === range.value && styles.rangeButtonTextActive,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary Cards */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryValue}>
            ${analytics.totalSpent.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Avg/Day</Text>
          <Text style={styles.summaryValue}>
            ${analytics.averagePerDay.toFixed(2)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Transactions</Text>
          <Text style={styles.summaryValue}>
            {analytics.transactionCount}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Avg/Transaction</Text>
          <Text style={styles.summaryValue}>
            ${analytics.averagePerTransaction.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Spending Over Time */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Spending Over Time</Text>
        <SpendingLineChart data={analytics.dailyTotals} />
      </View>

      {/* Category Breakdown */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Category Breakdown</Text>
        <CategoryPieChart data={analytics.byCategory} />
      </View>

      {/* Monthly Comparison */}
      <View style={styles.chartSection}>
        <Text style={styles.chartTitle}>Monthly Comparison</Text>
        <MonthlyBarChart data={analytics.monthlyTotals} />
      </View>

      {/* Trend Insight */}
      {analytics.monthOverMonthTrend.previous > 0 && (
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Month-over-Month</Text>
          <Text style={[
            styles.insightValue,
            { color: analytics.monthOverMonthTrend.trend === 'up' ? '#FF6B6B' : '#4ECDC4' }
          ]}>
            {analytics.monthOverMonthTrend.trend === 'up' ? '↑' : '↓'}
            {Math.abs(analytics.monthOverMonthTrend.change).toFixed(1)}%
          </Text>
          <Text style={styles.insightDescription}>
            {analytics.monthOverMonthTrend.trend === 'up'
              ? 'Spending increased from last month'
              : 'Spending decreased from last month'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  rangeSelector: {
    backgroundColor: 'white',
    paddingVertical: 12,
  },
  rangeSelectorContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  rangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  rangeButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  rangeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  rangeButtonTextActive: {
    color: 'white',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  chartSection: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  insightTitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  insightValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: '#666',
  },
});
```

### 7.2 Budgets Tab

Create `app/(tabs)/budgets.tsx`:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBudgets } from '@/contexts/BudgetContext';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { BudgetFormData } from '@/types/budget';

export default function BudgetsScreen() {
  const { currentMonthSummary, createBudget, loading } = useBudgets();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleCreateBudget = async (data: BudgetFormData) => {
    const { error } = await createBudget(data);
    if (!error) {
      setShowCreateForm(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Monthly Summary */}
        {currentMonthSummary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>This Month</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Budget</Text>
              <Text style={styles.summaryValue}>
                ${currentMonthSummary.totalBudget.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Spent</Text>
              <Text style={[
                styles.summaryValue,
                currentMonthSummary.percentageUsed > 100 && styles.overBudget
              ]}>
                ${currentMonthSummary.totalSpent.toFixed(2)}
              </Text>
            </View>

            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(currentMonthSummary.percentageUsed, 100)}%`,
                    backgroundColor:
                      currentMonthSummary.percentageUsed > 100
                        ? '#FF6B6B'
                        : currentMonthSummary.percentageUsed >= 80
                        ? '#F39C12'
                        : '#4ECDC4',
                  },
                ]}
              />
            </View>

            <Text style={styles.percentageText}>
              {currentMonthSummary.percentageUsed}% used
            </Text>
          </View>
        )}

        {/* Category Budgets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Budgets</Text>

          {currentMonthSummary?.categories.map((budget, index) => (
            <BudgetCard key={index} budget={budget} />
          ))}

          {(!currentMonthSummary || currentMonthSummary.categories.length === 0) && (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No budgets set</Text>
              <Text style={styles.emptySubtext}>
                Create a budget to track your spending
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateForm(true)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Create Budget Modal */}
      <Modal
        visible={showCreateForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Budget</Text>
            <TouchableOpacity onPress={() => setShowCreateForm(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <BudgetForm
            onSubmit={handleCreateBudget}
            onCancel={() => setShowCreateForm(false)}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  overBudget: {
    color: '#FF6B6B',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginTop: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4ECDC4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
});
```

---

## 8. Implementation Order

### 8.1 Week 1: Database & Core Services

- [ ] Run database migrations (budgets, notification_settings tables)
- [ ] Create TypeScript types (budget.ts, analytics.ts, notification.ts)
- [ ] Implement budget service (`lib/budgets.ts`)
- [ ] Implement analytics service (`lib/analytics.ts`)
- [ ] Implement budget calculator (`lib/budget-calculator.ts`)
- [ ] Add category colors constant

### 8.2 Week 2: Context & State Management

- [ ] Create BudgetContext with CRUD operations
- [ ] Update ExpensesContext with analytics methods
- [ ] Add memoization for performance
- [ ] Test context integration with existing features

### 8.3 Week 3: Analytics UI

- [ ] Install Victory Native XL
- [ ] Create chart components (Line, Pie, Bar)
- [ ] Create EmptyChartState component
- [ ] Build Analytics screen
- [ ] Add date range filtering
- [ ] Test with various data scenarios

### 8.4 Week 4: Budget Management UI

- [ ] Create BudgetCard component
- [ ] Create BudgetForm component
- [ ] Build Budgets screen
- [ ] Implement budget CRUD operations
- [ ] Add budget progress indicators
- [ ] Test budget calculations

### 8.5 Week 5: Notifications

- [ ] Request notification permissions
- [ ] Implement notification service
- [ ] Add budget alert logic
- [ ] Create notification settings screen
- [ ] Schedule daily reminders
- [ ] Test notification flows

### 8.6 Week 6: Polish & Testing

- [ ] Handle edge cases (empty data, large datasets)
- [ ] Performance optimization (memoization, chart sampling)
- [ ] Add loading states and error handling
- [ ] Implement skeleton loaders
- [ ] Write integration tests
- [ ] User acceptance testing

---

## 9. Testing Strategy

### 9.1 Unit Tests

- Budget calculations (percentages, remaining amounts)
- Analytics aggregations (by category, by month, by day)
- Date range filtering
- Trend calculations

### 9.2 Integration Tests

- Budget CRUD with database
- Analytics data flow (expenses → context → UI)
- Notification scheduling

### 9.3 UI Tests

- Chart rendering with different data sizes
- Empty state handling
- Budget progress indicators
- Form validation

### 9.4 Performance Tests

- Chart rendering with 1000+ data points
- Analytics calculation with 10k+ expenses
- Memory usage during long scrolling sessions

---

## 10. Dependencies to Install

```bash
# Charts
npm install victory-native

# Notifications
npx expo install expo-notifications

# Optional: Date utilities
npm install date-fns
```

---

## 11. Success Metrics

### Performance

- [ ] Analytics screen loads in <1s
- [ ] Charts render in <500ms
- [ ] No frame drops during scrolling
- [ ] Memory usage <100MB

### Functionality

- [ ] All charts display correctly with real data
- [ ] Budget alerts trigger at correct thresholds
- [ ] Calculations are accurate (budget vs actual)
- [ ] Graceful handling of empty/partial data

### User Experience

- [ ] Intuitive navigation between analytics views
- [ ] Clear visual feedback for budget status
- [ ] Helpful empty states with actionable guidance
- [ ] Smooth animations and transitions

---

## 12. Future Enhancements (Phase 3+)

- Export data to CSV/PDF
- Multi-currency support
- Shared budgets (family accounts)
- Budget templates and recommendations
- Predictive spending insights
- Bill reminders and recurring expenses
- Custom notification rules
- Widget for home screen
