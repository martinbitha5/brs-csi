import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/authService';
import { useTranslation } from '@/hooks/use-translation';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t('common.error'), t('login.error.empty'));
      return;
    }

    setLoading(true);
    try {
      const result = await authService.login(email.trim(), password);
      if (result.success && result.user) {
        // Rediriger vers l'interface appropriée selon le rôle de l'utilisateur
        const defaultRoute = authService.getDefaultRouteForRole();
        router.replace(defaultRoute as any);
      } else {
        Alert.alert(t('login.error.failed'), result.error || t('login.error.generic'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('login.error.generic'));
    } finally {
      setLoading(false);
    }
  };

  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    input: {
      backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
      borderColor: isDark ? '#333333' : '#E0E0E0',
      color: isDark ? '#ECEDEE' : '#11181C',
    },
    button: {
      backgroundColor: isDark ? '#007AFF' : '#007AFF',
    },
    buttonDisabled: {
      backgroundColor: isDark ? '#333333' : '#CCCCCC',
    },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <ThemedView style={styles.logoContainer}>
              <Ionicons
                name="airplane"
                size={64}
                color={isDark ? '#007AFF' : '#007AFF'}
                style={styles.logo}
              />
            </ThemedView>
            <ThemedText type="title" style={styles.title}>
              {t('login.title')}
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
              {t('login.subtitle')}
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={isDark ? '#999' : '#666'}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder={t('login.email')}
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={isDark ? '#999' : '#666'}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder={t('login.password')}
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={isDark ? '#999' : '#666'}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                dynamicStyles.button,
                (loading || !email.trim() || !password.trim()) && dynamicStyles.buttonDisabled,
              ]}
              onPress={handleLogin}
              disabled={loading || !email.trim() || !password.trim()}
            >
              <ThemedText style={styles.buttonText}>
                {loading ? t('login.button.loading') : t('login.button')}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <ThemedText style={styles.signupText}>
                {t('login.noAccount')}{' '}
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <ThemedText style={styles.signupLink}>
                  {t('login.signup')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 52,
    paddingLeft: 48,
    paddingRight: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signupText: {
    fontSize: 14,
    opacity: 0.7,
  },
  signupLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});

