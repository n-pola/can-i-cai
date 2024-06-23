import { createApp } from 'vue';
import { createPinia } from 'pinia';
import Toast, { POSITION, type PluginOptions } from 'vue-toastification';
import { i18nInstance } from '@/utils/i18n';
import ToastCloseIcon from '@/components/atoms/ToastCloseIcon.vue';
import FloatingVue from 'floating-vue';

import 'vue-toastification/dist/index.css';
import 'floating-vue/dist/style.css';
import '@/assets/styles/main.scss';

import App from './App.vue';
import router from './router';

const toastOptions: PluginOptions = {
  position: POSITION.TOP_RIGHT,
  timeout: 7000,
  transition: 'Vue-Toastification__fade',
  draggable: false,
  icon: false,
  closeButton: ToastCloseIcon,
  hideProgressBar: true,
};

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(i18nInstance);
app.use(Toast, toastOptions);
app.use(FloatingVue);

app.mount('#app');
