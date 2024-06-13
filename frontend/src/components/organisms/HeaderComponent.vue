<script setup lang="ts">
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
</template>

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
</style>
