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
  | "budget_warning" // % of budget reached
  | "budget_exceeded" // 100% of budget exceeded
  | "daily_reminder" // Daily reminder to log expenses
  | "weekly_summary"; // Weekly spending summary

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}
