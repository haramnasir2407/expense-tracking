/**
 * UUID Generation Utility
 * 
 * Generates RFC4122 compliant UUIDs compatible with PostgreSQL UUID type
 */

/**
 * Generate a v4 UUID
 * @returns A valid UUID string
 */
export function generateUUID(): string {
  // Use crypto.randomUUID() if available (modern browsers/Node 19+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback to manual generation (RFC4122 v4)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validate if a string is a valid UUID
 * @param uuid The string to validate
 * @returns True if valid UUID
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
