import { AuthButton } from "@/components/auth/AuthButton";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ExpenseFormData } from "@/types/expense";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CategoryPicker } from "./CategoryPicker";
import { ReceiptUpload } from "./ReceiptUpload";

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ExpenseForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Save Expense",
}: ExpenseFormProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [amount, setAmount] = useState(initialData?.amount || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [date, setDate] = useState(initialData?.date || new Date());
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [receiptUrl, setReceiptUrl] = useState(initialData?.receipt_url);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [amountError, setAmountError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  const validateForm = (): boolean => {
    let isValid = true;

    setAmountError("");
    setCategoryError("");

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setAmountError("Please enter a valid amount");
      isValid = false;
    }

    if (!category) {
      setCategoryError("Please select a category");
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await onSubmit({
        amount,
        category,
        date,
        notes,
        receipt_url: receiptUrl,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Amount Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Amount *</Text>
            <View
              style={[
                styles.inputContainer,
                { borderColor: colors.text + "30" },
              ]}
            >
              <Text style={[styles.currencySymbol, { color: colors.text }]}>
                $
              </Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  setAmountError("");
                }}
                placeholder="0.00"
                placeholderTextColor={colors.text + "50"}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
            {amountError ? (
              <Text style={styles.errorText}>{amountError}</Text>
            ) : null}
          </View>

          {/* Category Picker */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Category *
            </Text>
            <TouchableOpacity
              style={[
                styles.pickerButton,
                {
                  borderColor: colors.text + "30",
                  backgroundColor: colors.tint + "10",
                },
              ]}
              onPress={() => setShowCategoryPicker(true)}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  {
                    color: category ? colors.text : colors.text + "50",
                  },
                ]}
              >
                {category || "Select a category"}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.text} />
            </TouchableOpacity>
            {categoryError ? (
              <Text style={styles.errorText}>{categoryError}</Text>
            ) : null}
          </View>

          {/* Date Picker */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Date</Text>
            <View
              style={[styles.dateDisplay, { borderColor: colors.text + "30" }]}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.text + "99"}
              />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {formatDate(date)}
              </Text>
            </View>
          </View>

          {/* Notes Input */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Notes (Optional)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  borderColor: colors.text + "30",
                  color: colors.text,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional details..."
              placeholderTextColor={colors.text + "50"}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Receipt Upload - Temporarily disabled for Expo Go */}
          {/* Uncomment when using development build or remove for production */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Receipt (Optional)
            </Text>
            <ReceiptUpload
              receiptUrl={receiptUrl}
              onUpload={setReceiptUrl}
              onRemove={() => setReceiptUrl(undefined)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { borderTopColor: colors.text + "20" }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.text + "30" }]}
          onPress={onCancel}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <View style={styles.submitButtonContainer}>
          <AuthButton
            title={submitLabel}
            loading={loading}
            onPress={handleSubmit}
          />
        </View>
      </View>

      {/* Category Picker Modal */}
      <CategoryPicker
        visible={showCategoryPicker}
        selectedCategory={category}
        onSelect={(selectedCategory) => {
          setCategory(selectedCategory);
          setCategoryError("");
        }}
        onClose={() => setShowCategoryPicker(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  dateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: "#FF4444",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonContainer: {
    flex: 1,
  },
});
