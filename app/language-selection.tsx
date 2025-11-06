import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { languageService, Language } from '@/services/languageService';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'lingala', name: 'Lingala', nativeName: 'Lingála', flag: '🇨🇩' },
  { code: 'swahili', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇹🇿' },
];

export default function LanguageSelectionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);

  // Animations pour les boutons
  const buttonAnimations = languages.map(() => ({
    scale: useSharedValue(0),
    opacity: useSharedValue(0),
  }));

  React.useEffect(() => {
    // Animation d'entrée séquentielle pour les boutons
    buttonAnimations.forEach((anim, index) => {
      anim.scale.value = withDelay(
        index * 100,
        withSpring(1, { damping: 15, stiffness: 150 })
      );
      anim.opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
    });
  }, []);

  const handleLanguageSelect = async (language: Language) => {
    setSelectedLanguage(language);
    await languageService.setLanguage(language);
    
    // Petite animation de confirmation avant de naviguer
    setTimeout(() => {
      router.replace('/login');
    }, 300);
  };

  const dynamicStyles = {
    container: {
      backgroundColor: isDark ? '#000000' : '#FFFFFF',
    },
    button: {
      backgroundColor: isDark ? '#1A1A1A' : '#F5F5F5',
      borderColor: isDark ? '#333333' : '#E0E0E0',
    },
    buttonSelected: {
      backgroundColor: isDark ? '#007AFF' : '#007AFF',
      borderColor: isDark ? '#007AFF' : '#007AFF',
    },
    buttonText: {
      color: isDark ? '#ECEDEE' : '#11181C',
    },
    buttonTextSelected: {
      color: '#FFFFFF',
    },
  };

  return (
    <SafeAreaView style={[styles.container, dynamicStyles.container]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedView style={styles.logoContainer}>
              <Ionicons
                name="language"
                size={64}
                color={isDark ? '#007AFF' : '#007AFF'}
                style={styles.logo}
              />
            </ThemedView>
            <ThemedText type="title" style={styles.title}>
              Choisissez votre langue
            </ThemedText>
            <ThemedText type="subtitle" style={styles.subtitle}>
              Select your language
            </ThemedText>
          </View>

          {/* Language Options */}
          <View style={styles.languagesContainer}>
            {languages.map((lang, index) => {
              const isSelected = selectedLanguage === lang.code;
              const anim = buttonAnimations[index];
              
              const animatedStyle = useAnimatedStyle(() => ({
                transform: [{ scale: anim.scale.value }],
                opacity: anim.opacity.value,
              }));

              return (
                <Animated.View key={lang.code} style={animatedStyle}>
                  <TouchableOpacity
                    style={[
                      styles.languageButton,
                      dynamicStyles.button,
                      isSelected && dynamicStyles.buttonSelected,
                    ]}
                    onPress={() => handleLanguageSelect(lang.code)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.languageContent}>
                      <Text style={styles.flag}>{lang.flag}</Text>
                      <View style={styles.languageTextContainer}>
                        <ThemedText
                          style={[
                            styles.languageName,
                            isSelected ? dynamicStyles.buttonTextSelected : dynamicStyles.buttonText,
                          ]}
                        >
                          {lang.name}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.languageNativeName,
                            isSelected ? dynamicStyles.buttonTextSelected : dynamicStyles.buttonText,
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
                </Animated.View>
              );
            })}
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    // Logo styles
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
  languagesContainer: {
    gap: 16,
  },
  languageButton: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  languageNativeName: {
    fontSize: 14,
    opacity: 0.8,
  },
  checkIcon: {
    marginLeft: 8,
  },
});

