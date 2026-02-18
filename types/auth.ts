import {
  Session as SupabaseSession,
  User as SupabaseUser,
} from "@supabase/supabase-js";

export type User = SupabaseUser;
export type Session = SupabaseSession;

export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

export enum BiometricType {
  NONE = 0,
  FINGERPRINT = 1,
  FACIAL_RECOGNITION = 2,
  IRIS = 3,
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  biometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
}
