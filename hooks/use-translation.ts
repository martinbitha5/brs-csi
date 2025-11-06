import { useState, useEffect, useCallback } from 'react';
import { languageService, Language } from '@/services/languageService';
import { getTranslation, TranslationKey } from '@/constants/translations';

export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('fr');

  useEffect(() => {
    // Charger la langue au démarrage
    const loadLanguage = async () => {
      const language = await languageService.loadStoredLanguage();
      setCurrentLanguage(language);
    };
    loadLanguage();

    // Écouter les changements de langue en vérifiant périodiquement
    const checkLanguage = setInterval(() => {
      const language = languageService.getCurrentLanguage();
      setCurrentLanguage(prevLang => {
        if (language !== prevLang) {
          return language;
        }
        return prevLang;
      });
    }, 100);

    return () => clearInterval(checkLanguage);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return getTranslation(currentLanguage, key);
  }, [currentLanguage]);

  return { t, currentLanguage };
}

