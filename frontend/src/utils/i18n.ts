import { createI18n } from 'vue-i18n';
import englishLocales from '@/assets/locales/en.json';
import germanLocales from '@/assets/locales/de.json';

export const i18nInstance = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: englishLocales,
    de: germanLocales,
  },
});

export const i18n = i18nInstance.global;
