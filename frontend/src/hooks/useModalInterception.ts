import { ref } from 'vue';

/**
 * Hook to intercept actions and open a modal to confirm or abort them
 */
export const useModalInterception = () => {
  const confirmFn = ref<(() => void) | null>(null);
  const abortFn = ref<(() => void) | null>(null);
  const isOpen = ref(false);
  const tmpData = ref<{ [key: string]: any }>({});

  /** Open the confirm modal and save confirm/abort actions to be called by modal */
  const interceptAction = (
    confirm: () => void,
    abort: () => void,
    data?: { [key: string]: any },
  ) => {
    confirmFn.value = confirm;
    abortFn.value = abort;
    if (data) {
      tmpData.value = data;
    }
    isOpen.value = true;
  };

  /** Clear the hooks data after an action */
  const clearData = () => {
    confirmFn.value = null;
    abortFn.value = null;
    tmpData.value = {};
  };

  /** Calls the previously saved confirm action */
  const confirmAction = () => {
    confirmFn.value?.();
    isOpen.value = false;
    clearData();
  };

  /** Calls the previously saved abort action */
  const abortAction = () => {
    abortFn.value?.();
    isOpen.value = false;
    clearData();
  };

  return {
    isOpen,
    interceptAction,
    confirmAction,
    abortAction,
    tmpData,
  };
};
