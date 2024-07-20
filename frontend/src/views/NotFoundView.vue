<script setup lang="ts">
import LegalContainer from '@/components/atoms/LegalContainer.vue';
import Button from '@/components/atoms/Button.vue';
import { useI18n } from 'vue-i18n';

// Hooks
const i18n = useI18n();
</script>

<template>
  <LegalContainer>
    <h1>404 :/</h1>
    <h4>{{ i18n.t('pageNotFound') }}</h4>
    <RouterLink to="/" class="not-found__link" :title="i18n.t('homepage')">
      <Button>{{ i18n.t('homepage') }}</Button>
    </RouterLink>
  </LegalContainer>
</template>

<style scoped lang="scss">
.not-found {
  &__link {
    display: inline-block;
  }
}
</style>
