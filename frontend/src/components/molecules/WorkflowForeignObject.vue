<script setup lang="ts">
import { ref, computed } from 'vue';
import { type PopulatedComponent, type PopulatedCustomComponent } from 'cic-shared';
import WorkflowComponent from '@/components/molecules/WorkflowComponent.vue';

defineProps<{
  component: PopulatedComponent | PopulatedCustomComponent;
  y: number;
}>();

const emit = defineEmits<{
  delete: [];
}>();

const componentRef = ref<{ componentRef: HTMLElement } | null>(null);
const objectRef = ref<SVGForeignObjectElement | null>(null);

const height = computed(() => componentRef.value?.componentRef.scrollHeight || 0);

defineExpose({
  objectRef,
});
</script>

<template>
  <foreignObject x="0" :y="y" width="240" :height="height" ref="objectRef">
    <WorkflowComponent :component="component" ref="componentRef" @delete="emit('delete')" />
  </foreignObject>
</template>
