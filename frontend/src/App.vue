<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
</script>

<template>
  <header>
    <RouterLink to="/">
      <img alt="Can I CAI? Logo" class="logo" src="@/assets/logo.svg" />
    </RouterLink>
    <nav id="language">
      <button
        class="language-button"
        :class="{ 'language-button--active': i18n.locale.value === 'en' }"
        @click="i18n.locale.value = 'en'"
        type="button"
      >
        <abbr lang="en" title="English">EN</abbr>
      </button>
      <span>/</span>
      <button
        class="language-button"
        :class="{ 'language-button--active': i18n.locale.value === 'de' }"
        @click="i18n.locale.value = 'de'"
        type="button"
      >
        <abbr lang="en" title="Deutsch">DE</abbr>
      </button>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>
</template>

<style lang="scss">
#app {
  display: flex;
  flex-flow: column;
  width: 100vw;
  height: 100vh;
}

header {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  padding: $s $l;
  border-bottom: 1px solid $lighter;

  .logo {
    height: $l;
  }
}

main {
  flex: 1;
  transform: translate3d(0, 0, 0);
}

.language-button {
  &:hover {
    cursor: pointer;
  }

  & abbr {
    color: inherit;
  }

  &--active {
    color: $primary;
  }
}
</style>
