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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CategoryPicker } from "./CategoryPicker";
import { ReceiptUpload } from "./ReceiptUpload";
import { expenseFormStyles as styles } from "./styles";

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
  // Use empty string when no receipt so updates can clear the field
  const [receiptUrl, setReceiptUrl] = useState(initialData?.receipt_url || "");
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
        contentContainerStyle={styles.scrollContent}
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

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Receipt (Optional)
            </Text>
            <ReceiptUpload
              receiptUrl={receiptUrl || undefined}
              onUpload={setReceiptUrl}
              onRemove={() => setReceiptUrl("")}
            />
          </View>
        </View>

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
      </ScrollView>

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
