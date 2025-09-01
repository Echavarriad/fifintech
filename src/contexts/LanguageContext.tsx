import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loadLanguage, changeLanguage as changeI18nLanguage, getCurrentLanguage, getAvailableLanguages, t as i18nT } from '../i18n';

interface Language {
  code: string;
  name: string;
}

interface LanguageContextType {
  currentLanguage: string;
  availableLanguages: Language[];
  changeLanguage: (languageCode: string) => Promise<void>;
  t: (key: string, options?: any) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('es');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const availableLanguages = getAvailableLanguages();

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const savedLanguage = await loadLanguage();
        setCurrentLanguage(savedLanguage);
      } catch (error) {
        console.error('Error initializing language:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const changeLanguage = async (languageCode: string): Promise<void> => {
    try {
      await changeI18nLanguage(languageCode);
      setCurrentLanguage(languageCode);
    } catch (error) {
      console.error('Error changing language:', error);
      throw error;
    }
  };

  const t = (key: string, options?: any): string => {
    return i18nT(key, options);
  };

  const value: LanguageContextType = {
    currentLanguage,
    availableLanguages,
    changeLanguage,
    t,
    isLoading,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};