import { ExpenseListSection } from "@/components/expenses/ExpenseListSection";
import { ExpenseSummary } from "@/components/expenses/ExpenseSummary";
import { Ionicons } from "@expo/vector-icons";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { homeViewStyles as styles } from "./styles";

export interface GroupedExpenseItem {
  date: string;
  total: number;
  expenses: {
    id: string;
    user_id: string;
    amount: number;
    category: string;
    date: string;
    notes?: string;
    receipt_url?: string;
    created_at: string;
    updated_at: string;
  }[];
}

interface HomeViewProps {
  groupedExpenses: GroupedExpenseItem[];
  loading: boolean;
  onRefresh: () => void;
  onAddPress: () => void;
  colors: {
    background: string;
    text: string;
    tint: string;
  };
}

export function HomeView({
  groupedExpenses,
  loading,
  onRefresh,
  onAddPress,
  colors,
}: HomeViewProps) {
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="wallet-outline" size={64} color={colors.text + "40"} />
        <Text style={[styles.emptyText, { color: colors.text + "99" }]}>
          No expenses yet
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.text + "66" }]}>
          Tap the + button to add your first expense
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={groupedExpenses}
        renderItem={({ item }) => (
          <ExpenseListSection
            date={item.date}
            total={item.total}
            expenses={item.expenses}
          />
        )}
        keyExtractor={(item) => item.date}
        ListHeaderComponent={<ExpenseSummary />}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
        contentContainerStyle={
          groupedExpenses.length === 0 && !loading
            ? styles.emptyListContainer
            : styles.listContent
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={onAddPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
