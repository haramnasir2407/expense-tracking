import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { getCategories } from "@/service/expenses-supabase";
import { Category } from "@/types/expense";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { categoryPickerStyles as styles } from "./styles";

interface CategoryPickerProps {
  visible: boolean;
  selectedCategory?: string;
  onSelect: (category: string) => void;
  onClose: () => void;
}

export function CategoryPicker({
  visible,
  selectedCategory,
  onSelect,
  onClose,
}: CategoryPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadCategories();
    }
  }, [visible]);

  async function loadCategories() {
    setLoading(true);
    const { data, error } = await getCategories();
    if (!error && data) {
      setCategories(data);
    }
    setLoading(false);
  }

  const handleSelect = (categoryName: string) => {
    onSelect(categoryName);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View
            style={[styles.header, { borderBottomColor: colors.text + "20" }]}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              Select Category
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : (
            <ScrollView style={styles.scrollView}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor:
                        selectedCategory === category.name
                          ? colors.tint + "20"
                          : "transparent",
                      borderColor: colors.text + "20",
                    },
                  ]}
                  onPress={() => handleSelect(category.name)}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      {
                        backgroundColor: category.color || colors.tint + "20",
                      },
                    ]}
                  >
                    <Ionicons
                      name={(category.icon as any) || "pricetag"}
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    {category.name}
                  </Text>
                  {selectedCategory === category.name && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.tint}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
