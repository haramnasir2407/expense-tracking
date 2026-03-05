import { HomeView } from "@/components/home/HomeView";
import { useAppTheme } from "@/hooks/use-tamagui-theme";
import { useExpenses } from "@/hooks/useExpenses";
import { router } from "expo-router";
import React from "react";

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { groupedExpenses, loading, refresh } = useExpenses();

  return (
    <HomeView
      groupedExpenses={groupedExpenses}
      loading={loading}
      onRefresh={refresh}
      onAddPress={() => router.push("/expenses/add")}
      colors={{ ...colors, tint: colors.primary }}
    />
  );
}
