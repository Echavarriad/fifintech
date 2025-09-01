import I18n from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import es from './locales/es.json';
import en from './locales/en.json';

I18n.translations = {
  es,
  en,
};

I18n.defaultLocale = 'es';
I18n.locale = 'es';
I18n.fallbacks = true;

const LANGUAGE_KEY = '@app_language';

export const loadLanguage = async (): Promise<string> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      I18n.locale = savedLanguage;
      return savedLanguage;
    }
  } catch (error) {
    console.log('Error loading language:', error);
  }
  return 'es';
};

export const changeLanguage = async (language: string): Promise<void> => {
  try {
    I18n.locale = language;
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.log('Error saving language:', error);
    throw error;
  }
};

export const getCurrentLanguage = (): string => {
  return I18n.locale;
};

export const getAvailableLanguages = () => [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
];

export const t = (key: string, options?: any): string => {
  return I18n.t(key, options);
};

export default I18n;