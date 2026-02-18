## Analytics & Insights

### Visualizations

- Line chart: spending over time.
- Pie / donut chart: category breakdown.
- Bar chart: month-over-month comparison.

### Requirements

- Choose a charting library and justify the choice.
- Explain performance strategy (memoization, aggregation, rendering).
- Handle empty, partial, and large datasets gracefully.

### Phase 2: Analytics, Budgets & Engagement

#### Tasks

- Implement monthly budgets per category.
- Budget vs actual calculations.
- Build analytics screens with charts.
- Integrate notifications for reminders and alerts.

#### Expectations

- Accurate calculations.
- Performant charts.
- Clean separation of business logic and UI.
- Thoughtful handling of permissions.

---

## Implementation Plan

**Full Implementation Plan**: See `PHASE_2_IMPLEMENTATION_PLAN.md`

### Quick Summary

**Charting Library**: Victory Native XL
- React Native native with Skia rendering
- Hardware-accelerated, performant
- Built-in gesture support
- Small bundle size (~200KB)

**Architecture**:
- Client-side aggregation with `useMemo` for performance
- New `BudgetContext` for budget management
- Extended `ExpensesContext` with analytics methods
- Notification service for alerts and reminders

**Database Changes**:
- `budgets` table: Store monthly category budgets
- `notification_settings` table: User notification preferences
- RLS policies for security

**Key Components**:
- `SpendingLineChart`: Daily spending trends
- `CategoryPieChart`: Category breakdown with donut chart
- `MonthlyBarChart`: Month-over-month comparison
- `BudgetCard`: Visual budget progress with color-coded status
- `BudgetForm`: Create/edit budget flows
