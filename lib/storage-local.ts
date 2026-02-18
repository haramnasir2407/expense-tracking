import { Paths, Directory, File } from 'expo-file-system';

// Create receipts directory in the app's document directory
const receiptsDir = new Directory(Paths.document, 'receipts');

/**
 * Initialize receipts directory
 */
async function ensureReceiptsDirectory() {
  if (!receiptsDir.exists) {
    await receiptsDir.create();
  }
}

/**
 * Upload (save) a receipt locally
 * @param fileUri - The URI of the file to save
 * @param userId - The user ID for organizing receipts
 * @returns Object with local file URI or error
 */
export async function uploadReceipt(
  fileUri: string,
  userId: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    await ensureReceiptsDirectory();

    // Generate unique filename
    const fileName = `${userId}_${Date.now()}.jpg`;
    const destinationFile = receiptsDir.createFile(fileName, 'image/jpeg');

    // Copy the file to our receipts directory
    const response = await fetch(fileUri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    await destinationFile.write(new Uint8Array(arrayBuffer));

    return { url: destinationFile.uri, error: null };
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return { url: null, error: error as Error };
  }
}

/**
 * Delete a receipt from local storage
 * @param url - The local file URI to delete
 * @returns Object with error if any
 */
export async function deleteReceipt(
  url: string
): Promise<{ error: Error | null }> {
  try {
    const file = new File(url);
    
    if (file.exists) {
      await file.delete();
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting receipt:', error);
    return { error: error as Error };
  }
}

/**
 * Get the receipt URL (for local files, this is the file URI)
 * @param path - The file path
 * @returns The file URI
 */
export function getReceiptUrl(path: string): string {
  return path;
}

/**
 * Check if a receipt exists
 * @param url - The local file URI
 * @returns Boolean indicating if the file exists
 */
export async function receiptExists(url: string): Promise<boolean> {
  try {
    const file = new File(url);
    return file.exists;
  } catch (error) {
    console.error('Error checking receipt existence:', error);
    return false;
  }
}

/**
 * Delete all receipts for a user (useful for cleanup)
 * @param userId - The user ID
 */
export async function deleteAllUserReceipts(userId: string): Promise<{ error: Error | null }> {
  try {
    await ensureReceiptsDirectory();
    
    const items = receiptsDir.list();
    const userFiles = items.filter(item => 
      item instanceof File && item.name.startsWith(userId)
    );

    await Promise.all(
      userFiles.map(file => file.delete())
    );

    return { error: null };
  } catch (error) {
    console.error('Error deleting user receipts:', error);
    return { error: error as Error };
  }
}
