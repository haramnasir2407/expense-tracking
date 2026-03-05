import { useExpenseCategories } from "@/hooks/useExpenseCategories";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, Modal, ScrollView, TouchableOpacity } from "react-native";

import { Text, View } from "tamagui";
import { AppPressable } from "../primitives/app-pressable";
import { IconCircle } from "../primitives/icon-circle";

import { useAppTheme } from "@/hooks/use-tamagui-theme";
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
  const { colors } = useAppTheme();
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
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: colors.text + "12" }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <ScrollView style={styles.scrollView}>
              {showAllOption && (
                <AppPressable
                  style={styles.categoryItem}
                  backgroundColor={
                    selectedCategory === "all" || !selectedCategory
                      ? colors.primary + "25"
                      : "transparent"
                  }
                  borderColor={
                    selectedCategory === "all" || !selectedCategory
                      ? colors.primary + "80"
                      : colors.text + "10"
                  }
                  onPress={() => handleSelect("all")}
                >
                  <IconCircle
                    size={40}
                    backgroundColor={colors.primary + "40"}
                    style={{ marginRight: 16 }}
                  >
                    <Ionicons name="apps" size={24} color="#FFFFFF" />
                  </IconCircle>
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    All
                  </Text>
                  {(selectedCategory === "all" || !selectedCategory) && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </AppPressable>
              )}
              {categories.map((category) => (
                <AppPressable
                  key={category.id}
                  style={styles.categoryItem}
                  backgroundColor={
                    selectedCategory === category.name
                      ? colors.primary + "25"
                      : "transparent"
                  }
                  borderColor={
                    selectedCategory === category.name
                      ? colors.primary + "80"
                      : colors.text + "20"
                  }
                  onPress={() => handleSelect(category.name)}
                >
                  <IconCircle
                    size={40}
                    backgroundColor={category.color || colors.primary + "20"}
                    style={{ marginRight: 16 }}
                  >
                    <Ionicons
                      name={(category.icon as any) || "pricetag"}
                      size={24}
                      color="#FFFFFF"
                    />
                  </IconCircle>
                  <Text style={[styles.categoryName, { color: colors.text }]}>
                    {category.name}
                  </Text>
                  {selectedCategory === category.name && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.primary}
                    />
                  )}
                </AppPressable>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}
