import "../tamagui.generated.css";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-get-random-values"; // Must be first for UUID support
import "react-native-reanimated";
import Toast from "react-native-toast-message";
import { TamaguiProvider } from "tamagui";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BudgetProvider } from "@/contexts/BudgetContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SyncProvider } from "@/contexts/SyncContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { registerBackgroundSyncTaskAsync } from "@/service/background-sync-task";
import { tamaguiConfig } from "@/tamagui.config";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const lastResponseHandled = useRef(false);

  useEffect(() => {
    // Register once when the shell mounts
    registerBackgroundSyncTaskAsync().catch((e) => {
      console.log("[BackgroundSync] register failed", e);
    });
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const inAuthGroup = segments[0] === "auth";

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated and not in auth screens
      router.replace("/auth/login");
    } else if (user && inAuthGroup) {
      // Redirect to tabs if authenticated and in auth screens
      router.replace("/(tabs)");
    }
  }, [user, segments, initialized, router]);

  // Deep link: when app is opened from a daily reminder notification tap, go to expenses tab
  useEffect(() => {
    if (!user || !lastNotificationResponse) return;
    const data = lastNotificationResponse.notification?.request?.content?.data as { type?: string } | undefined;
    if (data?.type !== "daily_reminder") return;
    if (lastResponseHandled.current) return;
    lastResponseHandled.current = true;
    router.replace("/(tabs)");
  }, [user, lastNotificationResponse, router]);

  // Listen for notification taps when app is in foreground or background
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification?.request?.content?.data as { type?: string } | undefined;
      if (data?.type === "daily_reminder" && user) {
        router.replace("/(tabs)");
      }
    });
    return () => sub.remove();
  }, [user, router]);

  // Show loading screen while checking auth state
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <TamaguiProvider
      config={tamaguiConfig}
      defaultTheme={colorScheme === "dark" ? "dark" : "light"}
    >
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="expenses" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
        <Toast />
      </ThemeProvider>
    </TamaguiProvider>
  );
}

export default function RootLayout() {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <NotificationProvider>
          <SyncProvider>
            <BudgetProvider>
              <RootLayoutNav />
            </BudgetProvider>
          </SyncProvider>
        </NotificationProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
