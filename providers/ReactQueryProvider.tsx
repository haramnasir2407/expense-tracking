import NetInfo from "@react-native-community/netinfo";
import {
  focusManager,
  onlineManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import React, { ReactNode, useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 15_000,
          },
        },
      }),
  );

  // Wire React Query online status to React Native NetInfo
  // this tells React Query whether the app is online, so it can pause/resume retries and refetches
  useEffect(() => {
    return onlineManager.setEventListener((setOnline) => {
      return NetInfo.addEventListener((state) => {
        const reachable =
          state.isInternetReachable === null ? true : state.isInternetReachable;
        setOnline(Boolean(state.isConnected && reachable));
      });
    });
  }, []);

  // Wire React Query focus status to React Native AppState
  // This lets React Query know when the app is in the foreground so it can refetch on focus 
  // and avoid doing work when the app is backgrounded
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (status: AppStateStatus) => {
        focusManager.setFocused(status === "active");
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
