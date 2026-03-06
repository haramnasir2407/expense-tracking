import { ExpenseDetailView } from "@/components/expenses/ExpenseDetailView";
import { ThemedView } from "@/components/primitives/themed-view";
import { Colors, spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenses } from "@/hooks/useExpenses";
import { Expense, ExpenseFormData } from "@/types/expense";
import { formatAmount, formatDate } from "@/utils/expense";
import { Ionicons } from "@expo/vector-icons";
import {
  Stack,
  router,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";
import { Spinner } from "tamagui";

export default function ExpenseDetailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { id } = useLocalSearchParams<{ id: string }>();
  const { expenses, deleteExpense, updateExpense } = useExpenses();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const found = expenses.find((e) => e.id === id);
    if (found) setExpense(found);
  }, [id, expenses]);

  const handleDelete = useCallback(() => {
    // Immediately delete and show toast feedback
    (async () => {
      const { error } = await deleteExpense(id);
      if (error) {
        Toast.show({ type: "error", text1: "Error deleting expense", text2: error });
      } else {
        Toast.show({ type: "success", text1: "Expense deleted" });
        router.back();
      }
    })();
  }, [deleteExpense, id]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Edit Expense" : "Expense Details",
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.text,
      headerShadowVisible: false,
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => (isEditing ? setIsEditing(false) : router.back())}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ),
      headerRight: !isEditing
        ? () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                <Ionicons name="create-outline" size={24} color={colors.tint} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={24} color="#FF4444" />
              </TouchableOpacity>
            </View>
          )
        : undefined,
    });
  }, [isEditing, navigation, colors, handleDelete]);

  const handleUpdate = async (data: ExpenseFormData) => {
    const { error } = await updateExpense(id, data);
    if (error) {
      Toast.show({ type: "error", text1: "Error updating expense", text2: error });
    } else {
      Toast.show({ type: "success", text1: "Expense updated" });
      setIsEditing(false);
    }
  };

  if (!expense) {
    return (
      <ThemedView>
        <View style={styles.loadingContainer}>
          <Spinner size="large" color={colors.tint as any} />
        </View>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true }} />
      <ExpenseDetailView
        expense={expense}
        formattedAmount={formatAmount(expense.amount)}
        formattedDate={formatDate(expense.date)}
        isEditing={isEditing}
        colors={colors}
        onUpdate={handleUpdate}
        onCancelEdit={() => setIsEditing(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  backButton: { padding: spacing.md, marginLeft: spacing.md },
  headerButtons: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  editButton: { padding: spacing.md },
  deleteButton: { padding: spacing.md, marginRight: spacing.md },
});
