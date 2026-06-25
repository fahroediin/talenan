'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import en from './locales/en.json';
import id from './locales/id.json';

type Locale = 'en' | 'id';

type Translations = typeof id;

interface LanguageContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => any;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

const translations: Record<Locale, Translations> = { en, id };

// Helper to access nested objects using dot notation (e.g. "common.save")
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, part) => {
    return acc && acc[part] !== undefined ? acc[part] : null;
  }, obj);
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale === 'en' || savedLocale === 'id') {
      setLocaleState(savedLocale);
    } else {
      // Default to Indonesian
      setLocaleState('id');
    }
    setMounted(true);
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
    // Refresh page or update context
  };

  const t = (key: string): string => {
    const translation = getNestedValue(translations[locale], key);
    if (translation === null || translation === undefined) {
      // Fallback to English
      const fallback = getNestedValue(translations['en'], key);
      return fallback !== null && fallback !== undefined ? fallback : key;
    }
    return translation;
  };

  // Prevent server-client mismatch by rendering fallback UI or children after mount
  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Non-hook helper for use in server components / static routes where context isn't available
export const getTranslation = (locale: Locale, key: string): string => {
  const dict = translations[locale] || translations['id'];
  const val = getNestedValue(dict, key);
  if (val === null || val === undefined) {
    const fallback = getNestedValue(translations['en'], key);
    return fallback !== null && fallback !== undefined ? fallback : key;
  }
  return val;
};
