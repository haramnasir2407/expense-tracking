import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BudgetFormData } from "@/types/budget";
import React, { useState } from "react";
import { Form, Text, View } from "tamagui";
import { CategoryPicker } from "../expenses/CategoryPicker";
import { ActionButtons } from "../primitives/action-buttons";
import { AppPressable } from "../primitives/app-pressable";
import { ThemedTextInput } from "../primitives/themed-text-input";
import { budgetFormStyles as styles } from "./styles";

interface BudgetFormProps {
  initialData?: Partial<BudgetFormData>;
  editMode?: boolean;
  onSubmit: (data: BudgetFormData) => Promise<void>;
  onCancel: () => void;
}

export function BudgetForm({
  initialData,
  editMode = false,
  onSubmit,
  onCancel,
}: BudgetFormProps) {
  const [amount, setAmount] = useState(initialData?.amount || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [month] = useState(initialData?.month || new Date());
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; category?: string }>(
    {},
  );
  const colorScheme = useColorScheme();
  const readOnlyBg = colorScheme === "dark" ? "#2C2C2E" : "#f5f5f5";

  const colors = Colors[colorScheme ?? "light"];

  const handleSubmit = async () => {
    const newErrors: { amount?: string; category?: string } = {};
    if (!category) newErrors.category = "Please select a category.";
    if (!amount) newErrors.amount = "Please enter a budget amount.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      await onSubmit({ amount, category, month });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form style={styles.container} onSubmit={handleSubmit}>
      <Text style={[styles.label, { color: colors.text }]}>Category</Text>
      {editMode ? (
        <View style={[styles.input, { backgroundColor: readOnlyBg }]}>
          <Text style={{ color: colors.text }}>{category}</Text>
        </View>
      ) : (
        <AppPressable
          style={styles.input}
          borderColor={errors.category ? Colors.error : colors.text + "20"}
          onPress={() => {
            setErrors((e) => ({ ...e, category: undefined }));
            setShowCategoryPicker(true);
          }}
        >
          <Text style={category ? { color: colors.text } : styles.placeholder}>
            {category || "Select Category"}
          </Text>
        </AppPressable>
      )}
      {errors.category && (
        <Text style={styles.errorText}>{errors.category}</Text>
      )}

      <Text style={[styles.label, { color: colors.text }]}>Monthly Budget</Text>
      <ThemedTextInput
        style={[styles.input, errors.amount ? styles.inputError : undefined]}
        value={amount}
        onChangeText={(v) => {
          setAmount(v);
          if (v) setErrors((e) => ({ ...e, amount: undefined }));
        }}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />
      {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}

      <ActionButtons
        containerStyle={styles.buttons}
        submitLabel="Save"
        onCancel={onCancel}
        onSubmit={handleSubmit}
        loading={loading}
        submitButtonDisabled={loading}
      />

      <CategoryPicker
        visible={showCategoryPicker}
        selectedCategory={category}
        onSelect={(cat) => {
          setCategory(cat);
          setShowCategoryPicker(false);
        }}
        onClose={() => setShowCategoryPicker(false)}
      />
    </Form>
  );
}
