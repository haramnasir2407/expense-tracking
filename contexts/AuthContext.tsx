import { formatAuthError } from "@/lib/auth-utils";
import { supabase } from "@/lib/supabase";
import { AuthContextType, AuthError, Session, User } from "@/types/auth";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// TODO: Add a key for the biometric enabled state (for different accounts)
const BIOMETRIC_ENABLED_KEY = "biometric_enabled";
const BIOMETRIC_EMAIL_KEY = "biometric_email";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [biometricEnabled, setBiometricEnabledState] = useState(false);

  useEffect(() => {
    // Initialize auth state
    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("Auth state changed:", event);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function initializeAuth() {
    try {
      // Get current session
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      // Check biometric preference
      const biometricPref = await SecureStore.getItemAsync(
        BIOMETRIC_ENABLED_KEY,
      );
      setBiometricEnabledState(biometricPref === "true");
    } catch (error) {
      console.error("Error initializing auth:", error);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }

  async function signIn(
    email: string,
    password: string,
  ): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    } catch (error) {
      return { error: formatAuthError(error as Error) };
    }
  }

  async function signUp(
    email: string,
    password: string,
  ): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: "expensetracking://auth/verify-email", // Handle email verification in the app
        },
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    } catch (error) {
      return { error: formatAuthError(error as Error) };
    }
  }

  async function signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
      // Clear biometric data
      // await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
      // await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
      // setBiometricEnabledState(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  async function resetPassword(
    email: string,
  ): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          // Deep link into the Expo Router route: /auth/reset-password
          redirectTo: "expensetracking://auth/reset-password",
        },
      );

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    } catch (error) {
      return { error: formatAuthError(error as Error) };
    }
  }

  async function updatePassword(
    newPassword: string,
  ): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error: formatAuthError(error) };
      }

      return { error: null };
    } catch (error) {
      return { error: formatAuthError(error as Error) };
    }
  }

  async function setBiometricEnabled(enabled: boolean): Promise<void> {
    try {
      if (enabled) {
        // Check if device supports biometric auth
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (!compatible || !enrolled) {
          throw new Error(
            "Biometric authentication is not available on this device",
          );
        }

        // Store biometric preference and user email
        await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
        if (user?.email) {
          await SecureStore.setItemAsync(BIOMETRIC_EMAIL_KEY, user.email);
        }
      } else {
        // Disable biometric auth
        await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
        await SecureStore.deleteItemAsync(BIOMETRIC_EMAIL_KEY);
      }

      setBiometricEnabledState(enabled);
    } catch (error) {
      console.error("Error setting biometric enabled:", error);
      throw error;
    }
  }

  async function authenticateWithBiometric(): Promise<boolean> {
    try {
      // Check if biometric is enabled
      const biometricPref = await SecureStore.getItemAsync(
        BIOMETRIC_ENABLED_KEY,
      );
      if (biometricPref !== "true") {
        return false;
      }

      // Check if device supports biometric auth
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) {
        return false;
      }

      // Authenticate with biometric
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access your expense tracker",
        fallbackLabel: "Use passcode",
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error("Error authenticating with biometric:", error);
      return false;
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    biometricEnabled,
    setBiometricEnabled,
    authenticateWithBiometric,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
