import { ExpenseDetailView } from "@/components/expenses/ExpenseDetailView";
import ThemedView from "@/components/primitives/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenses } from "@/hooks/useExpenses";
import { formatAmount, formatDate } from "@/lib/expense-utils";
import { Expense, ExpenseFormData } from "@/types/expense";
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
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

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
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await deleteExpense(id);
            if (error) Alert.alert("Error", error);
            else router.back();
          },
        },
      ],
    );
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
    if (error) Alert.alert("Error", error);
    else setIsEditing(false);
  };

  if (!expense) {
    return (
      <ThemedView>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
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
  backButton: { padding: 8, marginLeft: 8 },
  headerButtons: { flexDirection: "row", alignItems: "center", gap: 8 },
  editButton: { padding: 8 },
  deleteButton: { padding: 8, marginRight: 8 },
});
