<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useGlobalStore } from '@/stores/global';
import HeaderComponent from '@/components/organisms/HeaderComponent.vue';
import LoadingSpinner from '@/components/atoms/LoadingSpinner.vue';
import { onMounted, onUnmounted } from 'vue';

const i18n = useI18n();
const globalStore = useGlobalStore();
const route = useRoute();

const handleResize = () => {
  globalStore.windowWidth = window.innerWidth;
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <HeaderComponent />

  <main>
    <RouterView />
  </main>

  <footer v-if="!(globalStore.isMobile && route.path.includes('/check'))">
    <div class="footer-links">
      <RouterLink to="/imprint" class="footer-legal">{{ i18n.t('imprint') }}</RouterLink>
      <span> | </span>
      <RouterLink to="/privacy" class="footer-legal">{{ i18n.t('privacyPolicy') }}</RouterLink>
    </div>
  </footer>

  <div class="global-spinner" v-show="globalStore.spinnerVisible">
    <LoadingSpinner />
  </div>
</template>

<style lang="scss">
#app {
  display: flex;
  flex-flow: column;
  width: 100%;
  height: 100dvh;
}
</style>

<style lang="scss" scoped>
main {
  flex: 1;
  transform: translate3d(0, 0, 0);
}

footer {
  position: absolute;
  right: 0;
  bottom: 0;
  box-sizing: border-box;
  display: flex;
  flex-flow: row;
}

.footer-links {
  display: flex;
  gap: $xxs;
  padding: $s $grid-margin;
  background-color: $lightest;
}

.footer-legal {
  &:hover {
    color: $primary;
  }
}

.global-spinner {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100dvh;
  background-color: $darkest-50;
}
</style>
