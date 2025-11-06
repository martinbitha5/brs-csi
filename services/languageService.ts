// Service de gestion des langues

import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'fr' | 'en' | 'lingala' | 'swahili';

const STORAGE_KEY = '@brs_csi_language';
const DEFAULT_LANGUAGE: Language = 'fr';

let currentLanguage: Language = DEFAULT_LANGUAGE;

export const languageService = {
  // Charger la langue depuis le stockage
  loadStoredLanguage: async (): Promise<Language> => {
    try {
      const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedLanguage && ['fr', 'en', 'lingala', 'swahili'].includes(storedLanguage)) {
        currentLanguage = storedLanguage as Language;
        return currentLanguage;
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la langue:', error);
    }
    return DEFAULT_LANGUAGE;
  },

  // Définir la langue
  setLanguage: async (language: Language): Promise<void> => {
    try {
      currentLanguage = language;
      await AsyncStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la langue:', error);
    }
  },

  // Obtenir la langue actuelle
  getCurrentLanguage: (): Language => {
    return currentLanguage;
  },

  // Vérifier si une langue a été sélectionnée
  hasLanguageSelected: async (): Promise<boolean> => {
    try {
      const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      return storedLanguage !== null;
    } catch (error) {
      return false;
    }
  },
};

