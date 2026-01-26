import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationCS from './locales/cs.json';
import translationEN from './locales/en.json';
import translationUK from './locales/uk.json';

const resources = {
  cs: {
    translation: translationCS
  },
  en: {
    translation: translationEN
  },
  uk: {
    translation: translationUK
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'cs',
    lng: localStorage.getItem('language') || 'cs',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
