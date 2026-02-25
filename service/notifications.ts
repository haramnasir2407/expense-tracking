import { BudgetStatus } from "@/types/budget";
import { NotificationPayload, NotificationType } from "@/types/notification";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
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
    trigger: null,
  });
}

export async function scheduleDailyReminder(time: string) {
  // In development, make this easy to test by firing soon instead of waiting for the real time.
  if (__DEV__) {
    console.log("Scheduling daily reminder in development mode");
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Expense Reminder (Dev)",
        body: "Test notification: daily reminder is configured correctly.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        repeats: false,
      },
    });
    return;
  }

  const [hour, minute] = time.split(":").map(Number);

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Daily Expense Reminder",
      body: "Don't forget to log today's expenses!",
    },
    trigger: {
      // DAILY is supported on both iOS and Android; CALENDAR is iOS-only
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
