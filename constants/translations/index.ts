import { Language } from '@/services/languageService';
import { translations as frTranslations } from './fr';
import { translations as enTranslations } from './en';
import { translations as lingalaTranslations } from './lingala';
import { translations as swahiliTranslations } from './swahili';

export type TranslationKey = keyof typeof frTranslations;

export const translations: Record<Language, Record<TranslationKey, string>> = {
  fr: frTranslations,
  en: enTranslations,
  lingala: lingalaTranslations,
  swahili: swahiliTranslations,
};

export const getTranslation = (language: Language, key: TranslationKey): string => {
  return translations[language]?.[key] || translations.fr[key] || key;
};

