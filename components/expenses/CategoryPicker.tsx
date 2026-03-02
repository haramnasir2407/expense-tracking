import { CATEGORIES } from "@/constants/categories";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
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
  /** When true, show an "All" option first (e.g. for analytics filter). */
  showAllOption?: boolean;
}

export function CategoryPicker({
  visible,
  selectedCategory,
  onSelect,
  onClose,
  showAllOption,
}: CategoryPickerProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { categories, isLoading } = useExpenseCategories({ enabled: visible });

  const handleSelect = (categoryName: string): void => {
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

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.tint} />
            </View>
          ) : (
            <ScrollView style={styles.scrollView}>
              {showAllOption && (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor:
                        selectedCategory === "all" || !selectedCategory
                          ? colors.tint + "20"
                          : "transparent",
                      borderColor: colors.text + "20",
                    },
                  ]}
                  onPress={() => handleSelect("all")}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: colors.tint + "40" },
                    ]}
                  >
                    <Ionicons name="apps" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    All
                  </Text>
                  {(selectedCategory === "all" || !selectedCategory) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.tint}
                    />
                  )}
                </TouchableOpacity>
              )}
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
