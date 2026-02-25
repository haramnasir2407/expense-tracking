import * as notificationSettingsService from "@/service/notification-settings";
import * as notificationService from "@/service/notifications";
import { NotificationSettings } from "@/types/notification";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

interface NotificationContextType {
  settings: NotificationSettings | null;
  loading: boolean;
  hasPermission: boolean;
  requestPermission: () => Promise<boolean>;
  updateSettings: (
    updates: Partial<NotificationSettings>,
  ) => Promise<{ error: string | null }>;
  scheduleDailyReminder: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSettings();
      checkPermissions();
    } else {
      setSettings(null);
      setLoading(false);
    }
  }, [user?.id]);

  async function checkPermissions() {
    const granted = await notificationService.requestPermissions();
    setHasPermission(granted);
  }

  async function loadSettings() {
    if (!user?.id) return;

    setLoading(true);

    let { data, error } =
      await notificationSettingsService.getNotificationSettings(user.id);

    // If the user has no notification settings (no data found), create default settings
    if (error && error.code === "PGRST116") {
      const defaultSettings: Partial<NotificationSettings> = {
        budget_alerts_enabled: true,
        budget_threshold_percent: 80,
        daily_reminder_enabled: false,
        daily_reminder_time: "20:00:00",
        weekly_summary_enabled: true,
        weekly_summary_day: 0,
      };

      const result =
        await notificationSettingsService.createNotificationSettings(
          user.id,
          defaultSettings,
        );
      data = result.data;
      error = result.error;
    }

    if (!error && data) {
      setSettings(data);
    }

    setLoading(false);
  }

  async function requestPermission(): Promise<boolean> {
    const granted = await notificationService.requestPermissions();
    setHasPermission(granted);
    return granted;
  }

  async function updateSettings(updates: Partial<NotificationSettings>) {
    if (!user?.id) return { error: "Not authenticated" };

    const { data, error } =
      await notificationSettingsService.upsertNotificationSettings(
        user.id,
        updates,
      );

    if (error) {
      return { error: error.message };
    }

    if (data) {
      setSettings(data);

      if (data.daily_reminder_enabled && hasPermission) {
        await scheduleDailyReminder();
      } else {
        await notificationService.cancelAllNotifications();
      }
    }

    return { error: null };
  }

  async function scheduleDailyReminder() {
    if (!settings?.daily_reminder_enabled || !hasPermission) return;

    await notificationService.cancelAllNotifications();
    await notificationService.scheduleDailyReminder(
      settings.daily_reminder_time,
    );
  }

  async function cancelAllNotifications() {
    await notificationService.cancelAllNotifications();
  }

  const value: NotificationContextType = {
    settings,
    loading,
    hasPermission,
    requestPermission,
    updateSettings,
    scheduleDailyReminder,
    cancelAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  }
  return context;
}
