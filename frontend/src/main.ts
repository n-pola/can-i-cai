import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import Toast, { POSITION, type PluginOptions } from 'vue-toastification';

import '@/assets/styles/main.scss';
import 'vue-toastification/dist/index.css';
import englishLocales from '@/assets/locales/en.json';
import germanLocales from '@/assets/locales/de.json';

import App from './App.vue';
import router from './router';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: englishLocales,
    de: germanLocales,
  },
});

const toastOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 7000,
  transition: 'Vue-Toastification__fade',
  draggable: false,
};

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18n);
app.use(Toast, toastOptions);

app.mount('#app');
