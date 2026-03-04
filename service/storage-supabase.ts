import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import Toast from "react-native-toast-message";
import { supabase } from "./supabase";

// Must use EXPO_PUBLIC_ prefix for client-side env in Expo
const BUCKET_NAME = process.env.EXPO_PUBLIC_SUPABASE_BUCKET_NAME || "receipts";

function guessMimeTypeFromExtension(ext: string | undefined | null): string {
  const lower = (ext || "").toLowerCase();
  switch (lower) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
    case "heif":
      return "image/heic";
    default:
      return "image/jpeg";
  }
}

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
      Toast.show({
        type: "error",
        text1: "Error uploading receipt",
        text2: error.message,
      });
      return { url: null, error };
    } else {
      Toast.show({
        type: "success",
        text1: "Receipt uploaded successfully",
      });
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

// Offline-first helper: upload a receipt image from a local file URI
// and return its public URL. This is used by the sync layer when the
// device comes back online.
export async function uploadReceiptFromLocalUri(
  localUri: string,
  userId: string,
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: "base64",
    });
    const arrayBuffer = decode(base64);

    const ext = localUri.split(".").pop();
    const mimeType = guessMimeTypeFromExtension(ext);
    const fileName = `${Date.now()}.${ext || "jpg"}`;
    const filePath = `${userId}/${fileName}`;

    const fakeAsset = { mimeType } as ImagePicker.ImagePickerAsset;
    return await uploadReceipt(filePath, arrayBuffer, userId, fakeAsset);
  } catch (error) {
    return { url: null, error: error as Error };
  }
}
