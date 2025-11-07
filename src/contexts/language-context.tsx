'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations, TranslationKey } from '@/lib/translations';

// Élargir le type pour inclure toutes les langues supportées
type Language = 'fr' | 'en' | 'es' | 'de' | 'pt' | 'ja' | 'ko' | 'sg';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  supportedLanguages: { code: Language; name: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const supportedLanguages: { code: Language; name: string }[] = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'sg', name: 'Sango' },
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: TranslationKey): string => {
    // S'assurer que translations[language] existe, sinon utiliser 'fr' par défaut.
    const langDict = translations[language] || translations['fr'];
    return langDict[key] || translations['fr'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
