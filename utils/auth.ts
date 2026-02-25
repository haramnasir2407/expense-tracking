import { AuthError } from "@/types/auth";
import { AuthError as SupabaseAuthError } from "@supabase/supabase-js";

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 * Requirements: Minimum 8 characters, at least one letter and one number
 */
export function isStrongPassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasLetter && hasNumber;
}

/**
 * Gets password strength level (0-4)
 */
export function getPasswordStrength(password: string): {
  strength: number;
  label: string;
  color: string;
} {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["#ff4444", "#ff8800", "#ffbb33", "#00C851", "#007E33"];

  return {
    strength,
    label: labels[strength] || labels[0],
    color: colors[strength] || colors[0],
  };
}

/**
 * Formats Supabase auth errors into user-friendly messages
 */
export function formatAuthError(
  error: SupabaseAuthError | Error | null,
): AuthError | null {
  if (!error) return null;

  const message = error.message || "An unexpected error occurred";

  // Map common Supabase errors to user-friendly messages
  const errorMessages: Record<string, string> = {
    "Invalid login credentials": "Invalid email or password. Please try again.",
    "Email not confirmed":
      "Please verify your email address before logging in.",
    "User already registered": "An account with this email already exists.",
    "Password should be at least 6 characters":
      "Password must be at least 8 characters long.",
    "Unable to validate email address": "Please enter a valid email address.",
    "Email rate limit exceeded": "Too many requests. Please try again later.",
    "Invalid email or password": "Invalid email or password. Please try again.",
  };

  const friendlyMessage = errorMessages[message] || message;

  return {
    message: friendlyMessage,
    code: "code" in error ? error.code : undefined,
    status: "status" in error ? error.status : undefined,
  };
}

/**
 * Validates that two passwords match
 */
export function passwordsMatch(
  password: string,
  confirmPassword: string,
): boolean {
  return password === confirmPassword && password.length > 0;
}

/**
 * Sanitizes email by trimming and converting to lowercase
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
