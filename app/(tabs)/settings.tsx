import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { authService } from '@/services/authService';
import { languageService, Language } from '@/services/languageService';
import { UserRole } from '@/types';
import { Ionicons } from '@expo/vector-icons';

const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'lingala', name: 'Lingala', nativeName: 'Lingála', flag: '🇨🇩' },
  { code: 'swahili', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿' },
];

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return 'Administrateur';
    case UserRole.SUPERVISOR:
      return 'Superviseur';
    case UserRole.AGENT:
      return 'Agent';
    default:
      return role;
  }
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const currentUser = authService.getCurrentUser();
  const [currentLanguage, setCurrentLanguage] = useState<Language>('fr');

  useEffect(() => {
    // Charger la langue actuelle depuis AsyncStorage
    const loadLanguage = async () => {
      const language = await languageService.loadStoredLanguage();
      setCurrentLanguage(language);
    };
    loadLanguage();
  }, []);

  const handleLanguageChange = async (language: Language) => {
    // Mettre à jour la langue dans le service
    await languageService.setLanguage(language);
    
    // Mettre à jour la langue dans le profil utilisateur si connecté
    if (currentUser) {
      await authService.updateUserLanguage(language);
    }
    
    // Recharger la langue depuis AsyncStorage pour s'assurer qu'elle est bien synchronisée
    const loadedLanguage = await languageService.loadStoredLanguage();
    setCurrentLanguage(loadedLanguage);
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    header: {
      ...styles.header,
      backgroundColor: isDark ? '#151718' : '#FFFFFF',
      borderBottomColor: isDark ? '#2A2A2A' : '#E5E7EB',
    },
    headerContent: {
      backgroundColor: isDark ? '#151718' : '#FFFFFF',
    },
    section: {
      backgroundColor: isDark ? '#151718' : '#FFFFFF',
      borderColor: isDark ? '#2A2A2A' : '#E5E7EB',
    },
    sectionTitle: {
      color: isDark ? '#ECEDEE' : '#11181C',
    },
    sectionSubtitle: {
      color: isDark ? '#9BA1A6' : '#687076',
    },
    settingItem: {
      backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
      borderColor: isDark ? '#2A2A2A' : '#E0E0E0',
    },
    settingItemText: {
      color: isDark ? '#ECEDEE' : '#11181C',
    },
    languageButton: {
      backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
      borderColor: isDark ? '#2A2A2A' : '#E0E0E0',
    },
    languageButtonSelected: {
      backgroundColor: isDark ? '#007AFF' : '#007AFF',
      borderColor: isDark ? '#007AFF' : '#007AFF',
    },
    logoutButton: {
      backgroundColor: isDark ? '#FF3B30' : '#FF3B30',
    },
  };

  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <ThemedView style={dynamicStyles.header}>
          <View style={styles.headerContent}>
            <ThemedText type="title" style={styles.title}>
              Paramètres
            </ThemedText>
          </View>
        </ThemedView>
        <View style={styles.content}>
          <ThemedText>Non connecté</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]} edges={['top']}>
      <ThemedView style={dynamicStyles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerRow}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Ionicons 
                  name="settings" 
                  size={28} 
                  color={isDark ? '#ECEDEE' : '#11181C'} 
                  style={styles.titleIcon}
                />
                <ThemedText type="title" style={styles.title}>
                  Paramètres
                </ThemedText>
              </View>
              <ThemedText type="subtitle" style={styles.subtitle}>
                Gérer vos préférences et votre compte
              </ThemedText>
            </View>
          </View>
        </View>
      </ThemedView>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Compte */}
        <View style={[styles.section, dynamicStyles.section]}>
          <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Compte
          </ThemedText>
          <ThemedText type="subtitle" style={[styles.sectionSubtitle, dynamicStyles.sectionSubtitle]}>
            Informations sur votre compte
          </ThemedText>
          
          <View style={[styles.settingItem, dynamicStyles.settingItem]}>
            <View style={styles.settingItemContent}>
              <Ionicons name="person" size={20} color={isDark ? '#9BA1A6' : '#687076'} />
              <View style={styles.settingItemTextContainer}>
                <ThemedText style={[styles.settingItemLabel, dynamicStyles.sectionSubtitle]}>
                  Nom
                </ThemedText>
                <ThemedText style={[styles.settingItemValue, dynamicStyles.settingItemText]}>
                  {currentUser.name}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.settingItem, dynamicStyles.settingItem]}>
            <View style={styles.settingItemContent}>
              <Ionicons name="mail" size={20} color={isDark ? '#9BA1A6' : '#687076'} />
              <View style={styles.settingItemTextContainer}>
                <ThemedText style={[styles.settingItemLabel, dynamicStyles.sectionSubtitle]}>
                  Email
                </ThemedText>
                <ThemedText style={[styles.settingItemValue, dynamicStyles.settingItemText]}>
                  {currentUser.email}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[styles.settingItem, dynamicStyles.settingItem]}>
            <View style={styles.settingItemContent}>
              <Ionicons name="shield-checkmark" size={20} color={isDark ? '#9BA1A6' : '#687076'} />
              <View style={styles.settingItemTextContainer}>
                <ThemedText style={[styles.settingItemLabel, dynamicStyles.sectionSubtitle]}>
                  Rôle
                </ThemedText>
                <ThemedText style={[styles.settingItemValue, dynamicStyles.settingItemText]}>
                  {getRoleLabel(currentUser.role)}
                </ThemedText>
              </View>
            </View>
          </View>

          {currentUser.station && (
            <View style={[styles.settingItem, dynamicStyles.settingItem]}>
              <View style={styles.settingItemContent}>
                <Ionicons name="location" size={20} color={isDark ? '#9BA1A6' : '#687076'} />
                <View style={styles.settingItemTextContainer}>
                  <ThemedText style={[styles.settingItemLabel, dynamicStyles.sectionSubtitle]}>
                    Station
                  </ThemedText>
                  <ThemedText style={[styles.settingItemValue, dynamicStyles.settingItemText]}>
                    {currentUser.station}
                  </ThemedText>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Section Langue */}
        <View style={[styles.section, dynamicStyles.section]}>
          <ThemedText type="defaultSemiBold" style={[styles.sectionTitle, dynamicStyles.sectionTitle]}>
            Langue
          </ThemedText>
          <ThemedText type="subtitle" style={[styles.sectionSubtitle, dynamicStyles.sectionSubtitle]}>
            Choisissez votre langue préférée
          </ThemedText>
          
          <View style={styles.languagesContainer}>
            {languages.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageButton,
                    dynamicStyles.languageButton,
                    isSelected && dynamicStyles.languageButtonSelected,
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.languageContent}>
                    <ThemedText style={styles.flag}>{lang.flag}</ThemedText>
                    <View style={styles.languageTextContainer}>
                      <ThemedText
                        style={[
                          styles.languageName,
                          isSelected ? styles.languageNameSelected : dynamicStyles.settingItemText,
                        ]}
                      >
                        {lang.name}
                      </ThemedText>
                      <ThemedText
                        style={[
                          styles.languageNativeName,
                          isSelected ? styles.languageNativeNameSelected : dynamicStyles.sectionSubtitle,
                        ]}
                      >
                        {lang.nativeName}
                      </ThemedText>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="#FFFFFF"
                        style={styles.checkIcon}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section Déconnexion */}
        <View style={[styles.section, dynamicStyles.section]}>
          <TouchableOpacity
            style={[styles.logoutButton, dynamicStyles.logoutButton]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.logoutButtonContent}>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <ThemedText style={styles.logoutButtonText}>
                Se déconnecter
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleIcon: {
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    marginLeft: 40,
    fontSize: 15,
    opacity: 0.7,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  settingItem: {
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingItemLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  settingItemValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  languagesContainer: {
    marginTop: 12,
    gap: 12,
  },
  languageButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 28,
    marginRight: 12,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageNameSelected: {
    color: '#FFFFFF',
  },
  languageNativeName: {
    fontSize: 14,
  },
  languageNativeNameSelected: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  checkIcon: {
    marginLeft: 8,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  logoutButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

