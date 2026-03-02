import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { deleteReceipt, uploadReceipt } from "@/service/storage-supabase";
import { Ionicons } from "@expo/vector-icons";
import { decode } from "base64-arraybuffer";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import ExpoMlkitOcr from "expo-mlkit-ocr";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { receiptUploadStyles as styles } from "./styles";

type ReceiptOcrPrefill = {
  amount?: number;
  date?: Date;
  notes?: string;
};

interface ReceiptUploadProps {
  receiptUrl?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  onOcrPrefill?: (data: ReceiptOcrPrefill) => void;
}

export function ReceiptUpload({
  receiptUrl,
  onUpload,
  onRemove,
  onOcrPrefill,
}: ReceiptUploadProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const parseReceiptText = (text: string): ReceiptOcrPrefill => {
    const lines = text.split(/\r?\n/).map((line) => line.trim());
    const nonEmptyLines = lines.filter((line) => line.length > 0);

    let amount: number | undefined;
    const amountCandidates: { value: number; priority: number }[] = [];
    const rupeeAmountCandidates: { value: number; priority: number }[] = [];

    for (const rawLine of nonEmptyLines) {
      const line = rawLine.trim();
      const lower = line.toLowerCase();
      const hasRupee =
        /\brs\.?\b/.test(lower) || /\bpkr\b/.test(lower) || /₨/.test(line);

      const matches = line.match(/([\d,]+[.,]\d{2})/g);
      if (!matches) continue;

      for (const match of matches) {
        const normalized = parseFloat(match.replace(/,/g, "").replace(",", "."));
        if (Number.isNaN(normalized)) continue;

        let priority = 0;
        if (/\btotal\b/.test(lower) || /\bamount\b/.test(lower)) {
          priority += 2;
        }
        if (/\bchange\b/.test(lower) || /\btax\b/.test(lower)) {
          priority -= 1;
        }

        if (hasRupee) {
          priority += 3;
          rupeeAmountCandidates.push({ value: normalized, priority });
        } else {
          amountCandidates.push({ value: normalized, priority });
        }
      }
    }

    const allCandidates =
      rupeeAmountCandidates.length > 0 ? rupeeAmountCandidates : amountCandidates;

    if (allCandidates.length > 0) {
      allCandidates.sort(
        (a, b) => b.priority - a.priority || b.value - a.value,
      );
      const pkrAmount = allCandidates[0].value;
      const PKR_PER_USD = 280; // Approximate PKR → USD conversion rate
      const usdAmount = pkrAmount / PKR_PER_USD;
      amount = Number(usdAmount.toFixed(2));
    }

    let date: Date | undefined;
    const datePatterns = [
      /\b(\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/, // 2026-03-02 or 2026/03/02
      /\b(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})\b/, // 03/02/26 or 03/02/2026
      /\b(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})\b/, // 2 Mar 2026
    ];

    outer: for (const line of nonEmptyLines) {
      for (const pattern of datePatterns) {
        const match = line.match(pattern);
        if (match?.[1]) {
          const candidate = new Date(match[1]);
          if (!Number.isNaN(candidate.getTime())) {
            date = candidate;
            break outer;
          }
        }
      }
    }

    let notes: string | undefined;
    const candidateNoteLines = nonEmptyLines
      .filter((line) => /[A-Za-z]/.test(line))
      .slice(0, 3);
    if (candidateNoteLines.length > 0) {
      notes = candidateNoteLines.join(" · ");
    }

    return { amount, date, notes };
  };

  const runOcrPrefill = async (uri: string) => {
    if (!onOcrPrefill) return;

    try {
      const result = await ExpoMlkitOcr.recognizeText(uri);
      const fullText = result?.text?.trim();
      if (!fullText) return;

      const parsed = parseReceiptText(fullText);
      const hasAmount = parsed.amount != null;
      const hasDate =
        parsed.date instanceof Date && !Number.isNaN(parsed.date.getTime());
      const hasNotes = !!parsed.notes && parsed.notes.trim().length > 0;

      if (hasAmount || hasDate || hasNotes) {
        onOcrPrefill(parsed);
        Toast.show({
          type: "success",
          text1: "Receipt scanned",
          text2: "We pre-filled details from your receipt.",
        });
      }
    } catch {
      // Ignore OCR errors so upload flow still works
    }
  };

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
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (!user?.id) {
        Alert.alert("Error", "You must be logged in to upload receipts");
        return;
      }

      const selectedAsset = result.assets[0];
      await runOcrPrefill(selectedAsset.uri);

      const base64 = await FileSystem.readAsStringAsync(selectedAsset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const arrayBuffer = decode(base64); // Decode base64 to ArrayBuffer

      const fileExt = selectedAsset.uri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; // user-specific path for RLS

      await handleUpload(filePath, arrayBuffer, selectedAsset);
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

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (!user?.id) {
        Alert.alert("Error", "You must be logged in to upload receipts");
        return;
      }

      const selectedAsset = result.assets[0];
      await runOcrPrefill(selectedAsset.uri);

      const base64 = await FileSystem.readAsStringAsync(selectedAsset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const arrayBuffer = decode(base64); // Decode base64 to ArrayBuffer
      const fileExt = selectedAsset.uri.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`; // user-specific path for RLS
      await handleUpload(filePath, arrayBuffer, selectedAsset);
    }
  };

  const handleUpload = async (
    filePath: string,
    arrayBuffer: ArrayBuffer,
    selectedAsset: ImagePicker.ImagePickerAsset,
  ) => {
    if (!user?.id) {
      Alert.alert("Error", "You must be logged in to upload receipts");
      return;
    }

    setUploading(true);
    try {
      const { url, error } = await uploadReceipt(
        filePath,
        arrayBuffer,
        user.id,
        selectedAsset,
      );

      if (error) {
        Toast.show({
          type: "error",
          text1: "Upload failed",
          text2: error.message,
        });
      } else if (url) {
        Toast.show({
          type: "success",
          text1: "Receipt uploaded",
        });
        onUpload(url);
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Upload error",
        text2: "Failed to upload receipt.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!receiptUrl) return;

    const { error } = await deleteReceipt(receiptUrl);
    if (error) {
      Toast.show({
        type: "error",
        text1: "Remove failed",
        text2: error.message,
      });
      return;
    }

    onRemove();
    Toast.show({
      type: "success",
      text1: "Receipt removed",
    });
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
