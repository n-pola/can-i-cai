<script setup lang="ts">
import { useI18n } from 'vue-i18n';

// Component setup
withDefaults(
  defineProps<{
    useTooltip?: boolean;
  }>(),
  {
    useTooltip: true,
  },
);

// Hooks
const i18n = useI18n();
</script>

<template>
  <div class="legend">
    <div class="legend__item">
      <div class="legend__icon legend__icon--compatible"></div>
      <span class="legend__text">{{ i18n.t('compatibilityLegend.compatible') }}</span>
    </div>
    <div class="legend__item">
      <div class="legend__icon legend__icon--incompatible"></div>
      <span class="legend__text">{{ i18n.t('compatibilityLegend.incompatible') }}</span>
    </div>
    <div class="legend__item">
      <div class="legend__icon legend__icon--partial"></div>
      <span v-if="useTooltip" class="legend__text">{{
        i18n.t('compatibilityLegend.partial')
      }}</span>
      <div v-else class="legend__text">
        {{ i18n.t('compatibilityLegend.partial') }}:<br />{{
          i18n.t('compatibilityLegend.partialExplanation')
        }}
      </div>
      <span
        v-if="useTooltip"
        class="material-symbols-outlined icon--xs legend__info"
        v-tooltip="i18n.t('compatibilityLegend.partialExplanation')"
        >info</span
      >
    </div>
  </div>
</template>

<style lang="scss">
/* stylelint-disable-next-line selector-class-pattern */
.v-popper--theme-tooltip {
  max-width: calc(($grid-column-width) * 2);
  background-color: $darker;
  border-radius: $border-radius;
  opacity: 1;

  /* stylelint-disable-next-line selector-class-pattern */
  & .v-popper__inner {
    padding: $xxs;
    color: $lighter;
    background-color: $darker;
    box-shadow: $shadow;
  }
}
</style>

<style scoped lang="scss">
.legend {
  display: flex;
  flex-flow: column;
  gap: $xxs;
  padding: $xxs;
  background: $lighter;
  border-radius: $border-radius;
  box-shadow: $shadow;

  &__item {
    display: flex;
    gap: $xxs;
    align-items: center;
  }

  &__icon {
    flex-shrink: 0;
    width: $xxs;
    height: 4px;

    &--compatible {
      background: $success;
    }

    &--incompatible {
      background: $error;
    }

    &--partial {
      background: $warning;
    }
  }

  &__info {
    margin-left: -$xxs / 2;
    cursor: pointer;
  }
}
</style>
