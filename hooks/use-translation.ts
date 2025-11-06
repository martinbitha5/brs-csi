import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { languageService, Language } from '@/services/languageService';
import { getTranslation, TranslationKey } from '@/constants/translations';

export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('fr');

  // Charger la langue au démarrage
  useEffect(() => {
    const loadLanguage = async () => {
      const language = await languageService.loadStoredLanguage();
      setCurrentLanguage(language);
    };
    loadLanguage();
  }, []);

  // Recharger la langue quand l'écran reprend le focus
  useFocusEffect(
    useCallback(() => {
      const loadLanguage = async () => {
        const language = await languageService.loadStoredLanguage();
        setCurrentLanguage(language);
      };
      loadLanguage();
    }, [])
  );

  // Écouter les changements de langue via le système d'événements
  useEffect(() => {
    const unsubscribe = languageService.subscribe((language: Language) => {
      setCurrentLanguage(language);
    });

    return unsubscribe;
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return getTranslation(currentLanguage, key);
  }, [currentLanguage]);

  return { t, currentLanguage };
}

