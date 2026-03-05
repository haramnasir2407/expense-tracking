import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ExpenseFormData } from "@/types/expense";
import { formatDateString } from "@/utils/expense";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useHeaderHeight } from "@react-navigation/elements";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Button, Form, ScrollView, Text, XStack, YStack } from "tamagui";
import { ActionButtons } from "../primitives/action-buttons";
import { AppPressable } from "../primitives/app-pressable";
import { ThemedTextInput } from "../primitives/themed-text-input";
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
  const headerHeight = useHeaderHeight();

  const [amount, setAmount] = useState(initialData?.amount || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [date, setDate] = useState(initialData?.date || new Date());
  const [notes, setNotes] = useState(initialData?.notes || "");
  // Use empty string when no receipt so updates can clear the field
  const [receiptUrl, setReceiptUrl] = useState(initialData?.receipt_url || "");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
    >
      <ScrollView
        style={[styles.scrollView, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Form style={styles.content} onSubmit={handleSubmit}>
          {/* Amount Input */}
          <YStack style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Amount *</Text>
            <XStack
              style={[
                styles.inputContainer,
                { borderColor: colors.text + "30" },
              ]}
            >
              <Text style={[styles.currencySymbol, { color: colors.text }]}>
                $
              </Text>
              <ThemedTextInput
                style={styles.input}
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  setAmountError("");
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
                autoFocus
              />
            </XStack>
            {amountError ? (
              <Text style={styles.errorText}>{amountError}</Text>
            ) : null}
          </YStack>

          {/* Category Picker */}
          <YStack style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Category *
            </Text>
            <AppPressable
              style={styles.pickerButton}
              borderColor={category ? colors.tint + "80" : colors.text + "40"}
              backgroundColor={category ? colors.tint + "15" : "transparent"}
              rightIcon="chevron-down"
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
            </AppPressable>
            {categoryError ? (
              <Text style={styles.errorText}>{categoryError}</Text>
            ) : null}
          </YStack>

          {/* Date Picker */}
          <YStack style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Date</Text>
            <Button
              unstyled
              onPress={() => setShowDatePicker(true)}
              pressStyle={{ opacity: 0.8 }}
            >
              <XStack
                style={[
                  styles.dateDisplay,
                  { borderColor: colors.text + "30" },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={colors.text + "99"}
                />
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {formatDateString(date)}
                </Text>
              </XStack>
            </Button>
          </YStack>

          {/* Notes Input */}
          <YStack style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Notes (Optional)
            </Text>
            <ThemedTextInput
              style={[
                styles.textArea,
                {
                  borderColor: colors.text + "30",
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional details..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </YStack>

          <YStack style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>
              Receipt (Optional)
            </Text>
            <ReceiptUpload
              receiptUrl={receiptUrl || undefined}
              onUpload={setReceiptUrl}
              onRemove={() => setReceiptUrl("")}
              onOcrPrefill={(data) => {
                if (data.amount != null) setAmount(String(data.amount));
                const receiptDate = data.date;
                if (
                  receiptDate instanceof Date &&
                  !Number.isNaN(receiptDate.getTime())
                ) {
                  setDate(new Date(receiptDate.getTime()));
                }
                if (data.notes && !notes) {
                  setNotes(data.notes);
                }
              }}
            />
          </YStack>
        </Form>

        <ActionButtons
          containerStyle={[
            styles.footer,
            { borderTopColor: colors.text + "20" },
          ]}
          buttonStyle={styles.button}
          cancelButtonStyle={styles.cancelButton}
          submitButtonStyle={styles.submitButton}
          cancelButtonTextStyle={styles.cancelText}
          submitButtonTextStyle={styles.submitText}
          onCancel={onCancel}
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel={submitLabel}
          submitButtonDisabled={loading}
        />
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(
            _event: DateTimePickerEvent,
            selectedDate?: Date | undefined,
          ) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setDate(selectedDate);
            }
          }}
        />
      )}

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
