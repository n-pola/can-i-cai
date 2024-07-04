import { defineStore } from 'pinia';
import { cssVariables } from '@/utils/cssVariables';

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
    isMobile: (state) => state.windowWidth <= cssVariables.breakPoints.mobile,
  },
});
