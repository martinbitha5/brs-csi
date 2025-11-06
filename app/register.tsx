import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/authService';
import { UserRole } from '@/types';
import { AIRPORTS } from '@/constants/airports';
import { Ionicons } from '@expo/vector-icons';
import { languageService } from '@/services/languageService';

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.AGENT);
  const [station, setStation] = useState<string>('FIH');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    // Validation pour les agents et superviseurs
    if ((role === UserRole.AGENT || role === UserRole.SUPERVISOR) && !station) {
      Alert.alert('Erreur', 'Veuillez sélectionner une station');
      return;
    }

    setLoading(true);
    try {
      // Récupérer la langue actuelle depuis le service de langue
      const currentLanguage = await languageService.loadStoredLanguage();
      
      const result = await authService.register(
        name.trim(),
        email.trim(),
        password,
        role,
        role === UserRole.ADMIN ? null : station,
        currentLanguage
      );

      if (result.success && result.user) {
        Alert.alert(
          'Inscription réussie',
          'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login'),
            },
          ]
        );
      } else {
        Alert.alert('Erreur d\'inscription', result.error || 'Une erreur est survenue');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de l\'inscription');
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
    picker: {
      backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
      color: isDark ? '#ECEDEE' : '#11181C',
    },
    button: {
      backgroundColor: isDark ? '#007AFF' : '#007AFF',
    },
    buttonDisabled: {
      backgroundColor: isDark ? '#333333' : '#CCCCCC',
    },
  };

  const roleOptions = [
    { label: 'Agent', value: UserRole.AGENT, description: 'Scanner les bagages et gérer les opérations quotidiennes' },
    { label: 'Superviseur', value: UserRole.SUPERVISOR, description: 'Superviser les opérations et générer des rapports' },
    { label: 'Administrateur', value: UserRole.ADMIN, description: 'Gérer les utilisateurs et la configuration' },
  ];

  const getRoleLabel = (role: UserRole): string => {
    return roleOptions.find(r => r.value === role)?.label || role;
  };

  const isFormValid = name.trim() && email.trim() && password.length >= 6 && password === confirmPassword;

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={isDark ? '#ECEDEE' : '#11181C'}
              />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>
              Créer un compte
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
              Remplissez les informations pour vous inscrire
            </ThemedText>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={isDark ? '#999' : '#666'}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder="Nom complet"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={isDark ? '#999' : '#666'}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder="Email"
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
                placeholder="Mot de passe (min. 6 caractères)"
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

            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={isDark ? '#999' : '#666'}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, dynamicStyles.input]}
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={isDark ? '#666' : '#999'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={isDark ? '#999' : '#666'}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.selectorButton, dynamicStyles.input]}
              onPress={() => setShowRoleModal(true)}
            >
              <Ionicons
                name="person-circle-outline"
                size={20}
                color={isDark ? '#999' : '#666'}
                style={styles.selectorIcon}
              />
              <ThemedText style={styles.selectorText}>
                {getRoleLabel(role)}
              </ThemedText>
              <Ionicons
                name="chevron-down-outline"
                size={20}
                color={isDark ? '#999' : '#666'}
              />
            </TouchableOpacity>

            {role !== UserRole.ADMIN && (
              <TouchableOpacity
                style={[styles.selectorButton, dynamicStyles.input]}
                onPress={() => setShowStationModal(true)}
              >
                <Ionicons
                  name="airplane-outline"
                  size={20}
                  color={isDark ? '#999' : '#666'}
                  style={styles.selectorIcon}
                />
                <ThemedText style={styles.selectorText}>
                  {AIRPORTS.find(a => a.code === station)?.name || station || 'Sélectionner une station'}
                </ThemedText>
                <Ionicons
                  name="chevron-down-outline"
                  size={20}
                  color={isDark ? '#999' : '#666'}
                />
              </TouchableOpacity>
            )}

            {/* Modal pour sélection du rôle */}
            <Modal
              visible={showRoleModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowRoleModal(false)}
            >
              <View style={styles.modalOverlay}>
                <ThemedView style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <ThemedText type="title" style={styles.modalTitle}>
                      Sélectionner le rôle
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() => setShowRoleModal(false)}
                      style={styles.closeButton}
                    >
                      <Ionicons name="close" size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.modalScroll}>
                    {roleOptions.map((option) => (
                      <TouchableOpacity
                        key={option.value}
                        style={[
                          styles.optionItem,
                          {
                            backgroundColor: role === option.value
                              ? (isDark ? '#1E3A5F' : '#EBF4FF')
                              : (isDark ? '#1F1F1F' : '#F9FAFB'),
                            borderColor: role === option.value
                              ? '#3B82F6'
                              : (isDark ? '#2A2A2A' : '#E5E7EB'),
                          },
                        ]}
                        onPress={() => {
                          setRole(option.value);
                          if (option.value === UserRole.ADMIN) {
                            setStation('');
                          } else if (!station) {
                            setStation('FIH');
                          }
                          setShowRoleModal(false);
                        }}
                      >
                        <View style={styles.optionContent}>
                          <ThemedText
                            style={[
                              styles.optionTitle,
                              { color: isDark ? '#FFFFFF' : '#111827' },
                            ]}
                          >
                            {option.label}
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.optionDescription,
                              { color: isDark ? '#9CA3AF' : '#6B7280' },
                            ]}
                          >
                            {option.description}
                          </ThemedText>
                        </View>
                        {role === option.value && (
                          <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </ThemedView>
              </View>
            </Modal>

            {/* Modal pour sélection de la station */}
            <Modal
              visible={showStationModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowStationModal(false)}
            >
              <View style={styles.modalOverlay}>
                <ThemedView style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <ThemedText type="title" style={styles.modalTitle}>
                      Sélectionner la station
                    </ThemedText>
                    <TouchableOpacity
                      onPress={() => setShowStationModal(false)}
                      style={styles.closeButton}
                    >
                      <Ionicons name="close" size={24} color={isDark ? '#D1D5DB' : '#6B7280'} />
                    </TouchableOpacity>
                  </View>
                  <ScrollView style={styles.modalScroll}>
                    {AIRPORTS.map((airport) => (
                      <TouchableOpacity
                        key={airport.code}
                        style={[
                          styles.optionItem,
                          {
                            backgroundColor: station === airport.code
                              ? (isDark ? '#1E3A5F' : '#EBF4FF')
                              : (isDark ? '#1F1F1F' : '#F9FAFB'),
                            borderColor: station === airport.code
                              ? '#3B82F6'
                              : (isDark ? '#2A2A2A' : '#E5E7EB'),
                          },
                        ]}
                        onPress={() => {
                          setStation(airport.code);
                          setShowStationModal(false);
                        }}
                      >
                        <View style={styles.optionContent}>
                          <ThemedText
                            style={[
                              styles.optionTitle,
                              { color: isDark ? '#FFFFFF' : '#111827' },
                            ]}
                          >
                            {airport.name}
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.optionDescription,
                              { color: isDark ? '#9CA3AF' : '#6B7280' },
                            ]}
                          >
                            {airport.code}
                          </ThemedText>
                        </View>
                        {station === airport.code && (
                          <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </ThemedView>
              </View>
            </Modal>

            <TouchableOpacity
              style={[
                styles.button,
                dynamicStyles.button,
                (loading || !isFormValid) && dynamicStyles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading || !isFormValid}
            >
              <ThemedText style={styles.buttonText}>
                {loading ? 'Inscription...' : 'S\'inscrire'}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <ThemedText style={styles.loginText}>
                Déjà un compte ?{' '}
              </ThemedText>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <ThemedText style={styles.loginLink}>
                  Se connecter
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
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
    padding: 8,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.7,
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
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingLeft: 48,
    paddingRight: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  selectorIcon: {
    position: 'absolute',
    left: 16,
  },
  selectorText: {
    flex: 1,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    maxHeight: '100%',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    opacity: 0.7,
  },
  loginLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});

