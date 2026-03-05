import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BudgetFormData } from "@/types/budget";
import React, { useState } from "react";
import { Text, View } from "tamagui";
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
  const colorScheme = useColorScheme();
  const readOnlyBg = colorScheme === "dark" ? "#2C2C2E" : "#f5f5f5";

  const colors = Colors[colorScheme ?? "light"];

  const handleSubmit = async () => {
    if (!amount || !category) return;

    setLoading(true);
    try {
      await onSubmit({ amount, category, month });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Category</Text>
      {editMode ? (
        <View style={[styles.input, { backgroundColor: readOnlyBg }]}>
          <Text style={{ color: colors.text }}>{category}</Text>
        </View>
      ) : (
        <AppPressable
          style={styles.input}
          onPress={() => setShowCategoryPicker(true)}
        >
          <Text style={category ? { color: colors.text } : styles.placeholder}>
            {category || "Select Category"}
          </Text>
        </AppPressable>
      )}

      <Text style={[styles.label, { color: colors.text }]}>Monthly Budget</Text>
      <ThemedTextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <ActionButtons
        containerStyle={styles.buttons}
        buttonStyle={styles.button}
        cancelButtonStyle={styles.cancelButton}
        submitButtonStyle={styles.submitButton}
        cancelButtonTextStyle={styles.cancelText}
        submitButtonTextStyle={styles.submitText}
        submitLabel="Save"
        onCancel={onCancel}
        onSubmit={handleSubmit}
        loading={loading}
        submitButtonDisabled={loading || !amount || !category}
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
    </View>
  );
}
