import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenses } from "@/hooks/useExpenses";
import { DateRange } from "@/types/analytics";
import React, { useMemo, useState } from "react";

export default function AnalyticsScreen() {
  const { getAnalytics } = useExpenses();
  const [selectedRange, setSelectedRange] = useState<DateRange>("month");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const analytics = useMemo(
    () => getAnalytics(selectedRange),
    [getAnalytics, selectedRange],
  );

  return (
    <AnalyticsView
      analytics={analytics}
      selectedRange={selectedRange}
      onSelectRange={setSelectedRange}
      isDark={colorScheme === "dark"}
      colors={colors}
    />
  );
}
