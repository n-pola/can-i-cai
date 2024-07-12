<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { type PopulatedComponent, type PopulatedCustomComponent } from 'cic-shared';
import WorkflowComponent from '@/components/molecules/WorkflowComponent.vue';
import { cssVariables } from '@/utils/cssVariables';
import { useWorkflowStore } from '@/stores/workflow';
import SvgAddButton from '@/components/atoms/SvgAddButton.vue';

// Component setup
const props = defineProps<{
  component: PopulatedComponent | PopulatedCustomComponent;
  compatible: boolean;
  id: string;
  y: number;
  x: number;
}>();

const emit = defineEmits<{
  delete: [];
  requestAddAfter: [];
  requestAddBefore: [];
  click: [];
  recenterPlane: [];
}>();

// Hooks
const workflowStore = useWorkflowStore();

// Daata
const componentRef = ref<{ componentRef: HTMLElement } | null>(null);
const objectRef = ref<SVGForeignObjectElement | null>(null);

// Computed values
const height = computed(() => componentRef.value?.componentRef.scrollHeight || 0);

const width = cssVariables.size.xxs * 24;

// Functions

/**
 * update the displayed nodes bounding box in the workflow store with a
 * dispatched height an recalculate all node positions from here on
 */
const updateMyPosition = () => {
  if (componentRef.value?.componentRef) {
    workflowStore.updateNodePosition(props.id, {
      x: props.x,
      y: props.y,
      width,
      height: componentRef.value.componentRef.scrollHeight,
    });
    workflowStore.recalculateNodePositionsFrom(props.id);
  }
};

defineExpose({
  objectRef,
  updateMyPosition,
});

// Lifecycle hooks
onMounted(() => {
  if (componentRef.value?.componentRef) {
    updateMyPosition();

    if (workflowStore.isFirstNode(props.id) && workflowStore.nodes.size === 1) {
      emit('recenterPlane');
    }
  }
});
</script>

<template>
  <g :transform="`translate(${x}, ${y})`">
    <SvgAddButton
      :x="width / 2"
      :y="-cssVariables.size.s - cssVariables.size.m / 2"
      :size="cssVariables.size.m"
      @click="emit('requestAddBefore')"
      title="Add component after this one"
      v-if="
        workflowStore.isFirstNode(props.id) &&
        !(component.type.length === 1 && component.type.includes('output'))
      "
    />
    <foreignObject :width="width" :height="height" ref="objectRef" @click="emit('click')">
      <WorkflowComponent
        :component="component"
        ref="componentRef"
        @delete="emit('delete')"
        :compatible="compatible"
      />
    </foreignObject>
    <SvgAddButton
      :x="width / 2"
      :y="height + cssVariables.size.s + cssVariables.size.m / 2"
      :size="cssVariables.size.m"
      @click="emit('requestAddAfter')"
      title="Add component after this one"
      v-if="workflowStore.isLastNode(props.id) && !component.type.includes('input')"
    />
  </g>
</template>
