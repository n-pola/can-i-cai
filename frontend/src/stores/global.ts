import { defineStore } from 'pinia';

interface GlobalStore {
  spinnerVisible: boolean;
}

export const useGlobalStore = defineStore('global', {
  state: (): GlobalStore => ({
    spinnerVisible: false,
  }),
});
