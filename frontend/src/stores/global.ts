import { defineStore } from 'pinia';

interface GlobalStore {
  spinnerVisible: boolean;
  windowWidth: number;
}

export const useGlobalStore = defineStore('global', {
  state: (): GlobalStore => ({
    spinnerVisible: false,
    windowWidth: window.innerWidth,
  }),
  getters: {
    isMobile: (state) => state.windowWidth < 768,
  },
});
