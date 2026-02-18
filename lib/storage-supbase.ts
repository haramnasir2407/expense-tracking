import { supabase } from "./supabase";


// TODO: create bucket in supabase and add to .env
const BUCKET_NAME = "receipts";

export async function uploadReceipt(
  fileUri: string,
  userId: string,
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Generate unique filename
    const fileName = `${userId}/${Date.now()}.jpg`;

    // Convert file URI to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      return { url: null, error };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

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
