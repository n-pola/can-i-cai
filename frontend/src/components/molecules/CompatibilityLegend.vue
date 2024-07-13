<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import ToolTip from '@/components/molecules/ToolTip.vue';

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
      <span v-if="useTooltip" class="legend__text"
        >{{ i18n.t('compatibilityLegend.partial') }}
        <ToolTip
          :content="i18n.t('compatibilityLegend.partialExplanation')"
          tool-tip-id="tooltip-partial-compatibility"
          class="legend__info"
        >
          <span
            class="material-symbols-outlined icon--xs"
            aria-describedby="tooltip-partial-compatibility"
            >info</span
          >
        </ToolTip>
      </span>
      <div v-else class="legend__text">
        {{ i18n.t('compatibilityLegend.partial') }}:<br />{{
          i18n.t('compatibilityLegend.partialExplanation')
        }}
      </div>
    </div>
  </div>
</template>

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

  &__text {
    display: flex;
    align-items: center;
  }

  &__info {
    margin-left: $xxs / 2;
    cursor: pointer;
  }
}
</style>
