import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenses } from "@/hooks/useExpenses";
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
  Image,
  ScrollView,
  StyleSheet,
  Text,
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
    const foundExpense = expenses.find((e) => e.id === id);
    if (foundExpense) {
      setExpense(foundExpense);
    }
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
            if (error) {
              Alert.alert("Error", error);
            } else {
              router.back();
            }
          },
        },
      ],
    );
  }, [deleteExpense, id]);

  // Update navigation options when isEditing changes
  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEditing ? "Edit Expense" : "Expense Details",
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

  const handleEdit = async (data: ExpenseFormData) => {
    const { error } = await updateExpense(id, data);
    if (error) {
      Alert.alert("Error", error);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!expense) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerStyle: {
            backgroundColor: colors.background,
          },
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
        }}
      />
      {isEditing ? (
        <ExpenseForm
          initialData={{
            amount: expense.amount.toString(),
            category: expense.category,
            date: new Date(expense.date),
            notes: expense.notes || "",
            receipt_url: expense.receipt_url,
          }}
          onSubmit={handleEdit}
          onCancel={handleCancelEdit}
          submitLabel="Update Expense"
        />
      ) : (
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.content}
        >
          {/* Amount Card */}
          <View
            style={[
              styles.amountCard,
              {
                backgroundColor: colors.tint + "20",
                borderColor: colors.tint + "40",
              },
            ]}
          >
            <Text style={[styles.amountLabel, { color: colors.text + "99" }]}>
              Amount
            </Text>
            <Text style={[styles.amountValue, { color: colors.text }]}>
              {formatAmount(expense.amount)}
            </Text>
          </View>

          {/* Details Section */}
          <View style={styles.section}>
            <View
              style={[
                styles.detailRow,
                { borderBottomColor: colors.text + "20" },
              ]}
            >
              <View style={styles.detailLabelContainer}>
                <Ionicons
                  name="pricetag-outline"
                  size={20}
                  color={colors.text + "99"}
                />
                <Text
                  style={[styles.detailLabel, { color: colors.text + "99" }]}
                >
                  Category
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {expense.category}
              </Text>
            </View>

            <View
              style={[
                styles.detailRow,
                { borderBottomColor: colors.text + "20" },
              ]}
            >
              <View style={styles.detailLabelContainer}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.text + "99"}
                />
                <Text
                  style={[styles.detailLabel, { color: colors.text + "99" }]}
                >
                  Date
                </Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {formatDate(expense.date)}
              </Text>
            </View>

            {expense.notes && (
              <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
                <View style={styles.detailLabelContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={colors.text + "99"}
                  />
                  <Text
                    style={[styles.detailLabel, { color: colors.text + "99" }]}
                  >
                    Notes
                  </Text>
                </View>
                <Text
                  style={[
                    styles.detailValue,
                    styles.notesValue,
                    { color: colors.text },
                  ]}
                >
                  {expense.notes}
                </Text>
              </View>
            )}
          </View>

          {/* Receipt Section - Hidden for Expo Go */}
          {expense.receipt_url && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Receipt
              </Text>
              <Image
                source={{ uri: expense.receipt_url }}
                style={[
                  styles.receiptImage,
                  { borderColor: colors.text + "20" },
                ]}
                resizeMode="cover"
              />
            </View>
          )}
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  amountCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 40,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    textAlign: "right",
    flex: 1,
  },
  notesValue: {
    marginTop: 8,
  },
  receiptImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    borderWidth: 1,
  },
});
