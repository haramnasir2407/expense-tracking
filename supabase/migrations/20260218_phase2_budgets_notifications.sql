-- Phase 2: Analytics, Budgets & Notifications Schema

-- Create budgets table
create table budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  amount decimal(10,2) not null check (amount > 0),
  month date not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  unique (user_id, category, month)
);

-- Enable RLS on budgets
alter table budgets enable row level security;

-- Budgets policies
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

-- Create notification_settings table
create table notification_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  budget_alerts_enabled boolean default true,
  budget_threshold_percent integer default 80 check (budget_threshold_percent between 0 and 100),
  daily_reminder_enabled boolean default false,
  daily_reminder_time time default '20:00:00',
  weekly_summary_enabled boolean default true,
  weekly_summary_day integer default 0 check (weekly_summary_day between 0 and 6),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on notification_settings
alter table notification_settings enable row level security;

-- Notification settings policies
create policy "Users can view own notification settings"
  on notification_settings for select
  using (auth.uid() = user_id);

create policy "Users can insert own notification settings"
  on notification_settings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own notification settings"
  on notification_settings for update
  using (auth.uid() = user_id);

-- Optional: Function to calculate budget vs actual for current month
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
