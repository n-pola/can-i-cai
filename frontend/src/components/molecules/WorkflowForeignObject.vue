<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { type PopulatedComponent, type PopulatedCustomComponent } from 'cic-shared';
import WorkflowComponent from '@/components/molecules/WorkflowComponent.vue';
import { cssVariables } from '@/utils/cssVariables';
import { useWorkflowStore } from '@/stores/workflow';
import SvgAddButton from '@/components/atoms/SvgAddButton.vue';

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
  click: [];
}>();

const workflowStore = useWorkflowStore();

const componentRef = ref<{ componentRef: HTMLElement } | null>(null);
const objectRef = ref<SVGForeignObjectElement | null>(null);

const height = computed(() => componentRef.value?.componentRef.scrollHeight || 0);

const width = cssVariables.size.xxs * 24;

defineExpose({
  objectRef,
});

onMounted(() => {
  if (componentRef.value?.componentRef) {
    workflowStore.updateNodePosition(props.id, {
      x: props.x,
      y: props.y,
      width,
      height: componentRef.value.componentRef.scrollHeight,
    });
    workflowStore.recalculateNodePositionsFrom(props.id);
  }
});
</script>

<template>
  <g :transform="`translate(${x}, ${y})`">
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
      v-if="workflowStore.isLastNode(props.id) && component.type.includes('output')"
    />
  </g>
</template>
