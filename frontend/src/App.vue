<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useI18n } from 'vue-i18n';
import HeaderComponent from '@/components/organisms/HeaderComponent.vue';

const i18n = useI18n();
</script>

<template>
  <HeaderComponent />

  <main>
    <RouterView />
  </main>

  <footer>
    <div class="footer-links">
      <RouterLink to="/imprint" class="footer-legal">{{ i18n.t('imprint') }}</RouterLink>
      <span> | </span>
      <RouterLink to="/privacy" class="footer-legal">{{ i18n.t('privacyPolicy') }}</RouterLink>
    </div>
  </footer>
</template>

<style lang="scss">
#app {
  display: flex;
  flex-flow: column;
  width: 100vw;
  height: 100vh;
}
</style>

<style lang="scss" scoped>
main {
  flex: 1;
  transform: translate3d(0, 0, 0);
}

footer {
  position: absolute;
  bottom: 0;
  left: 0;
  box-sizing: border-box;
  display: flex;
  flex-flow: row;
  justify-content: flex-end;
  width: 100%;
}

.footer-links {
  display: flex;
  gap: $xxs;
  padding: $s $l;
  background-color: $lightest;
}

.footer-legal {
  &:hover {
    color: $primary;
  }
}
</style>
