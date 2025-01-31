<script setup lang="ts">
import { computed, ref, watchEffect, toRef, onMounted, watch } from 'vue';
import Modal from '@/components/atoms/Modal.vue';
import Button from '@/components/atoms/Button.vue';
import BooleanInputPill from '@/components/molecules/BooleanInputPill.vue';
import type { FrontendNode } from '@/types/workflow';
import { useI18n } from 'vue-i18n';
import { type PopulatedComponent } from 'cic-shared';
import { getCategoryWithCompatibility } from '@/api/categories';
import WorkflowComponent from '@/components/molecules/WorkflowComponent.vue';
import { useWorkflowStore } from '@/stores/workflow';
import ToolTip from '@/components/molecules/ToolTip.vue';
import TypeExplanationModal from '@/components/molecules/TypeExplanationModal.vue';

// Component setup
const props = defineProps<{
  component: FrontendNode;
  nodeId: string;
}>();
const isOpen = defineModel<boolean>();
const emit = defineEmits<{
  alternativeClicked: [nodeId: string, componentId: string];
}>();

// Hooks
const workflowStore = useWorkflowStore();
const i18n = useI18n();

// Data
const showMissingInfo = ref(false);
const satisfiesMinimalVersion = toRef(props.component, 'satisfiesMinimalVersion');
const alternatives = ref<PopulatedComponent[]>([]);
const showTypeExplanationModal = ref(false);

// Watchers
watchEffect(() => {
  if (!isOpen.value) {
    showMissingInfo.value = false;
  }
});

watch(satisfiesMinimalVersion, () => {
  workflowStore.determineEdgeCompatibilityFromNode(props.nodeId);
});

// Computed values
const componentName = computed(() =>
  props.component.dataType === 'external-image'
    ? i18n.t(props.component.name)
    : props.component.name,
);

const content = computed(() => {
  return [
    {
      value: componentName.value,
      title: 'Name',
    },
    {
      value:
        typeof props.component.manufacturer === 'string'
          ? props.component.manufacturer
          : props.component.manufacturer.name,
      title: i18n.t('detailModal.manufacturer'),
    },
    {
      value: props.component.category.name[i18n.locale.value as 'en' | 'de'],
      title: i18n.t('detailModal.category'),
    },
    {
      value: props.component.type.map((type) => i18n.t(`types.${type}`)).join(', '),
      title: i18n.t('detailModal.type'),
      showHelpProp: showTypeExplanationModal,
    },
    {
      value: props.component.compatible ? 'check_circle' : 'cancel',
      title: i18n.t('detailModal.compatible'),
      isIcon: true,
      customClass: props.component.compatible
        ? 'component-details__icon--success'
        : 'component-details__icon--error',
      source: 'source' in props.component && props.component.source,
      isTested: 'tested' in props.component && props.component.tested,
    },
    {
      value:
        props.component.minimalRequiredVersion && `>= ${props.component.minimalRequiredVersion}`,
      title: i18n.t('detailModal.supportedVersions'),
    },
  ];
});

// Lifecycle hooks

onMounted(() => {
  if (props.component.compatible) return;

  getCategoryWithCompatibility(props.component.category.id, true)
    .then((data) => {
      alternatives.value = data.components;
    })
    .catch((error) => {
      console.error(error);
    });
});
</script>

<template>
  <Modal v-model="isOpen">
    <template #header>
      <h3>{{ i18n.t('detailModal.title') }}</h3>
    </template>

    <div class="component-details">
      <div
        v-for="(item, index) in content.filter((item) => item.value)"
        :key="index"
        class="component-details__detail"
      >
        <div class="component-details__detail-title">
          <h4>{{ item.title }}</h4>
          <ToolTip
            v-if="item.showHelpProp"
            :content="i18n.t('helpTooltip')"
            :tool-tip-id="`tooltip-${item.title}-help`"
          >
            <span
              class="material-symbols-outlined icon--s"
              @click="showTypeExplanationModal = !showTypeExplanationModal"
              @keypress.enter="showTypeExplanationModal = !showTypeExplanationModal"
              :aria-describedby="`tooltip-${item.title}-help`"
              >help</span
            >
          </ToolTip>
          <ToolTip
            v-if="item.source"
            :content="i18n.t('detailModal.source')"
            tool-tip-id="tooltip-verified"
          >
            <a
              :href="item.source"
              target="_blank"
              rel="noopener noreferrer"
              :title="i18n.t('detailModal.source')"
              class="component-details__detail-icon"
            >
              <span class="material-symbols-outlined icon--s" v-if="item.source">link</span>
            </a>
          </ToolTip>
          <ToolTip
            v-else-if="item.isTested"
            :content="i18n.t('detailModal.verifiedByMaintainers')"
            tool-tip-id="tooltip-verified"
          >
            <span
              class="material-symbols-outlined icon--s component-details__detail-icon component-details__detail-icon--verified"
              aria-describedby="tooltip-verified"
              >verified</span
            >
          </ToolTip>
        </div>
        <span
          v-if="item.isIcon"
          class="material-symbols-outlined icon--m icon--fill"
          :class="item.customClass"
          >{{ item.value }}</span
        >
        <h5 v-else>{{ item.value }}</h5>
      </div>
      <div
        class="component-details__detail"
        v-if="component.minimalRequiredVersion && satisfiesMinimalVersion !== undefined"
      >
        <h4>{{ i18n.t('detailModal.myVersionCompatible') }}</h4>
        <BooleanInputPill v-model="satisfiesMinimalVersion" />
      </div>
      <div v-if="component.additionalInfo" class="component-details__additional-info">
        <h4>{{ i18n.t('detailModal.additionalInfo') }}</h4>
        <div v-html="component.additionalInfo"></div>
      </div>
      <div class="component-details__alternative" v-if="alternatives.length">
        <h4>{{ i18n.t('detailModal.compatibleAlternatives') }}</h4>
        <WorkflowComponent
          v-for="alternative in alternatives.slice(0, 3)"
          :key="alternative.id"
          :component="alternative"
          :show-delete="false"
          :compatible="true"
          :full-width="true"
          @click="emit('alternativeClicked', nodeId, alternative.id)"
        />
      </div>
    </div>

    <template #footer>
      <div class="component-details__footer">
        <button
          class="component-details__correction-head"
          @click="showMissingInfo = !showMissingInfo"
          type="button"
        >
          <p>{{ i18n.t('detailModal.incorrectInfo') }}</p>
          <span class="material-symbols-outlined icon--s">{{
            showMissingInfo ? 'keyboard_arrow_up' : 'keyboard_arrow_down'
          }}</span>
        </button>
        <div class="component-details__correction-body" v-show="showMissingInfo">
          <a href="mailto:n.polarek@live.de">
            <Button full-width color="secondary">{{
              i18n.t('detailModal.contactMaintainer')
            }}</Button>
          </a>
          <a href="https://github.com/n-pola/can-i-cai" target="_blank" rel="noopener noreferrer">
            <Button full-width>{{ i18n.t('detailModal.viewGithub') }}</Button>
          </a>
        </div>
      </div>
    </template>
  </Modal>

  <TypeExplanationModal v-model="showTypeExplanationModal" />
</template>

<style lang="scss" scoped>
.component-details {
  display: flex;
  flex-direction: column;
  gap: $xs;
  width: 100%;
  padding: $xs $s;
  overflow-y: auto;

  &__detail {
    display: flex;
    justify-content: space-between;
  }

  &__detail-title {
    display: flex;
    gap: $xxs / 2;
    align-items: center;
    justify-content: center;
  }

  &__detail-icon {
    display: flex;
    color: $primary;

    &--verified {
      color: $secondary;
    }
  }

  &__icon {
    &--success {
      color: $success;
    }

    &--error {
      color: $error;
    }
  }

  &__footer {
    background-color: $lighter;
  }

  &__correction-head {
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: $xxs $xs;
    cursor: pointer;
  }

  &__correction-body {
    display: flex;
    gap: $xxs;
    padding: $xxs $xs $s $xs;

    & > * {
      flex: 1;
    }
  }

  &__additional-info {
    display: flex;
    flex-direction: column;
    gap: $xxs;

    & :deep(a) {
      color: $primary;
      text-decoration: underline;
    }
  }

  &__alternative {
    display: flex;
    flex-flow: column;
    gap: $xxs;
  }
}
</style>
