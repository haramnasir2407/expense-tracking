import { HomeView } from "@/components/home/HomeView";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenses } from "@/hooks/useExpenses";
import { router } from "expo-router";
import React from "react";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { groupedExpenses, loading, refresh } = useExpenses();

  return (
    <HomeView
      groupedExpenses={groupedExpenses}
      loading={loading}
      onRefresh={refresh}
      onAddPress={() => router.push("/expenses/add")}
      colors={colors}
    />
  );
}
