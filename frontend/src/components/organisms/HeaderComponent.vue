<script setup lang="ts">
import { toRefs, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import TextInput from '@/components/atoms/TextInput.vue';
import { useWorkflowStore } from '@/stores/workflow';
import { config } from '@/config';

const i18n = useI18n();
const route = useRoute();
const { name: workflowName } = toRefs(useWorkflowStore());

watchEffect(() => {
  document.title = workflowName?.value
    ? `${config.documentTitleBase} | ${workflowName?.value}`
    : `${config.documentTitleBase} | ${String(route.name)}`;
});
</script>

<template>
  <header class="header">
    <div>
      <RouterLink to="/" :title="i18n.t('homepage')" class="header__home-link">
        <img alt="Can I CAI? Logo" class="header__logo" src="@/assets/logo.svg" />
      </RouterLink>
    </div>

    <div class="header__workflow-name-wrap">
      <div v-if="route.path.includes('check')" class="header__workflow-name">
        <p class="header__input-ghost">{{ workflowName || i18n.t('untitledWorkflow') }}</p>
        <TextInput
          id="workflowName"
          label="Workflow Name"
          v-model="workflowName"
          :placeholder="i18n.t('untitledWorkflow')"
          class="header__input"
        />
      </div>
    </div>

    <nav id="language" class="header__language-switcher">
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
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: $xxs;
  align-items: center;
  padding: $s $l;
  border-bottom: 1px solid $lighter;

  @media screen and (width <= $bp-mobile) {
    padding: $s;
  }

  &__home-link {
    display: inline-flex;
  }

  &__logo {
    height: $l;
  }

  &__language-switcher {
    display: flex;
    justify-content: flex-end;
  }

  &__language-button {
    padding: 0 $xxs / 2;

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

  &__workflow-name-wrap {
    display: flex;
    justify-content: center;
  }

  &__workflow-name {
    display: flex;
    overflow: hidden;
    transform: translate3d(0, 0, 0);
  }

  &__input {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    padding: $xxs $xxs calc($xxs / 2);
    border-bottom: 2px solid $secondary;
    border-top-left-radius: $border-radius;
    border-top-right-radius: $border-radius;

    &:focus,
    &:hover {
      background-color: $lighter;
      border-color: $primary-light;
      outline: 0;
      box-shadow: none;
    }
  }

  &__input-ghost {
    height: $f-xs * $lh-base;
    padding: $xxs $xxs calc($xxs / 2);
    pointer-events: none;
    user-select: none;
    border-bottom: 2px solid transparent;
    opacity: 0;
    white-space-collapse: preserve;
  }
}
</style>
