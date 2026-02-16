import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import {
  isStrongPassword,
  getPasswordStrength,
  passwordsMatch,
} from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { updatePassword } = useAuth();
  const params = useLocalSearchParams();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const passwordStrength = getPasswordStrength(password);

  // Extract tokens from URL and establish session
  useEffect(() => {
    async function setupSession() {
      try {
        // Get access_token and refresh_token from URL params
        const accessToken = params.access_token as string | undefined;
        const refreshToken = params.refresh_token as string | undefined;

        if (accessToken && refreshToken) {
          // Set the session with the tokens from the magic link
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            Alert.alert(
              'Error',
              'Failed to validate reset link. Please request a new one.'
            );
            router.replace('/auth/forgot-password');
          } else {
            setSessionReady(true);
          }
        } else {
          // No tokens in URL - user navigated here directly
          Alert.alert(
            'Invalid Link',
            'Please use the link from your email to reset your password.'
          );
          router.replace('/auth/forgot-password');
        }
      } catch (error) {
        console.error('Error setting up session:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
        router.replace('/auth/forgot-password');
      }
    }

    setupSession();
  }, [params]);

  function validateForm(): boolean {
    let isValid = true;

    setPasswordError('');
    setConfirmPasswordError('');

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!isStrongPassword(password)) {
      setPasswordError('Password must be at least 8 characters with letters and numbers');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (!passwordsMatch(password, confirmPassword)) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  }

  async function handleResetPassword() {
    if (!sessionReady) {
      Alert.alert('Please wait', 'Setting up your session...');
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await updatePassword(password);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Success',
          'Your password has been reset successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/auth/login'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Show loading while session is being established
  if (!sessionReady) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Setting up your session...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.tint + '20' },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={40} color={colors.tint} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Set New Password
          </Text>
          <Text style={[styles.subtitle, { color: colors.text + 'CC' }]}>
            Enter a new password for your account
          </Text>
        </View>

        <View style={styles.form}>
          <AuthInput
            label="New Password"
            icon="lock-closed-outline"
            isPassword
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
            }}
            placeholder="Create a strong password"
            autoComplete="password-new"
            error={passwordError}
          />

          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBarContainer}>
                <View
                  style={[
                    styles.strengthBar,
                    {
                      width: `${(passwordStrength.strength / 4) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                {passwordStrength.label}
              </Text>
            </View>
          )}

          <AuthInput
            label="Confirm New Password"
            icon="lock-closed-outline"
            isPassword
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError('');
            }}
            placeholder="Re-enter your password"
            autoComplete="password-new"
            error={confirmPasswordError}
          />

          <AuthButton
            title="Reset Password"
            loading={loading}
            onPress={handleResetPassword}
            containerStyle={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
  },
  strengthContainer: {
    marginBottom: 16,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 8,
  },
});
