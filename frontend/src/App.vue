<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import { useI18n } from 'vue-i18n';

const i18n = useI18n();
</script>

<template>
  <header class="header">
    <RouterLink to="/" :title="i18n.t('homepage')" class="header__home-link">
      <img alt="Can I CAI? Logo" class="header__logo" src="@/assets/logo.svg" />
    </RouterLink>
    <nav id="language">
      <button
        class="header__language-button"
        :class="{ 'header__language-button--active': i18n.locale.value === 'en' }"
        @click="i18n.locale.value = 'en'"
        type="button"
      >
        <abbr lang="en" title="English">EN</abbr>
      </button>
      <span>/</span>
      <button
        class="header__language-button"
        :class="{ 'header__language-button--active': i18n.locale.value === 'de' }"
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
.header {
  display: flex;
  flex-flow: row;
  align-items: center;
  justify-content: space-between;
  padding: $s $l;
  border-bottom: 1px solid $lighter;

  &__home-link {
    display: flex;
  }

  &__logo {
    height: $l;
  }

  &__language-button {
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
}

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
