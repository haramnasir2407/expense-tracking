import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { deleteReceipt, uploadReceipt } from "@/lib/storage-supbase";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ReceiptUploadProps {
  receiptUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function ReceiptUpload({
  receiptUrl,
  onUpload,
  onRemove,
}: ReceiptUploadProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant photo library permissions to upload receipts.",
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUpload(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant camera permissions to take photos.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUpload(result.assets[0].uri);
    }
  };

  const handleUpload = async (fileUri: string) => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to upload receipts");
      return;
    }

    setUploading(true);
    try {
      const { url, error } = await uploadReceipt(fileUri, user.id);

      if (error) {
        Alert.alert("Upload Failed", error.message);
      } else if (url) {
        onUpload(url);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to upload receipt");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!receiptUrl) return;

    Alert.alert(
      "Remove Receipt",
      "Are you sure you want to remove this receipt?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await deleteReceipt(receiptUrl);
            onRemove();
          },
        },
      ],
    );
  };

  const showOptions = () => {
    Alert.alert("Add Receipt", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  if (uploading) {
    return (
      <View style={[styles.container, { borderColor: colors.text + "20" }]}>
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={[styles.uploadingText, { color: colors.text + "99" }]}>
          Uploading...
        </Text>
      </View>
    );
  }

  if (receiptUrl) {
    return (
      <View style={[styles.container, { borderColor: colors.text + "20" }]}>
        <Image source={{ uri: receiptUrl }} style={styles.image} />
        <TouchableOpacity
          style={[styles.removeButton, { backgroundColor: colors.background }]}
          onPress={handleRemove}
        >
          <Ionicons name="close-circle" size={28} color="#FF4444" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        styles.emptyContainer,
        {
          borderColor: colors.text + "20",
          backgroundColor: colors.tint + "10",
        },
      ]}
      onPress={showOptions}
    >
      <Ionicons name="camera-outline" size={40} color={colors.tint} />
      <Text style={[styles.addText, { color: colors.tint }]}>Add Receipt</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    borderStyle: "dashed",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 14,
  },
  addText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  uploadingText: {
    fontSize: 14,
    marginTop: 8,
  },
});
