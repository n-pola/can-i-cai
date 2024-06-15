import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast, { POSITION, type PluginOptions } from 'vue-toastification';
import { i18nInstance } from '@/utils/i18n';

import '@/assets/styles/main.scss';
import 'vue-toastification/dist/index.css';

import App from './App.vue';
import router from './router';

const toastOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 7000,
  transition: 'Vue-Toastification__fade',
  draggable: false,
};

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18nInstance);
app.use(Toast, toastOptions);

app.mount('#app');
