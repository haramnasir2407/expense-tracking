import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { BudgetFormData } from "@/types/budget";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CategoryPicker } from "../expenses/CategoryPicker";

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
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowCategoryPicker(true)}
        >
          <Text style={category ? { color: colors.text } : styles.placeholder}>
            {category || "Select Category"}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.label, { color: colors.text }]}>Monthly Budget</Text>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
        keyboardType="decimal-pad"
      />

      <View style={styles.buttons}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={loading}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading || !amount || !category}
        >
          <Text style={styles.submitText}>Save</Text>
        </TouchableOpacity>
      </View>

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

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  placeholder: {
    color: "#999",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  inputText: {
    color: "#333",
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  submitButton: {
    backgroundColor: "#0a7ea4",
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
