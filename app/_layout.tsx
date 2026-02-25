import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "react-native-get-random-values"; // Must be first for UUID support
import "react-native-reanimated";
import Toast from "react-native-toast-message";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BudgetProvider } from "@/contexts/BudgetContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SyncProvider } from "@/contexts/SyncContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ReactQueryProvider } from "@/providers/ReactQueryProvider";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

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

  // Show loading screen while checking auth state
  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="expenses" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
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
