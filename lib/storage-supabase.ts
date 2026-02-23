import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { supabase } from "./supabase";

// Must use EXPO_PUBLIC_ prefix for client-side env in Expo
const BUCKET_NAME = process.env.EXPO_PUBLIC_SUPABASE_BUCKET_NAME || "receipts";

export async function uploadReceipt(
  filePath: string,
  arrayBuffer: ArrayBuffer,
  userId: string,
  selectedAsset: ImagePicker.ImagePickerAsset,
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, arrayBuffer, {
        contentType: selectedAsset.mimeType || "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading receipt:", error.message);
      Alert.alert("Error uploading receipt:", error.message);
      return { url: null, error };
    } else {
      Alert.alert("Receipt uploaded successfully");
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);
    console.log("public url:", urlData.publicUrl);
    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
}

export async function deleteReceipt(
  url: string,
): Promise<{ error: Error | null }> {
  try {
    // Extract file path from URL
    const path = url.split(`${BUCKET_NAME}/`)[1];

    if (!path) {
      return { error: new Error("Invalid receipt URL") };
    }

    const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

    return { error };
  } catch (error) {
    return { error: error as Error };
  }
}

export function getReceiptUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return data.publicUrl;
}
