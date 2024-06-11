<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import WorkflowForeignObject from '@/components/molecules/WorkflowForeignObject.vue';
import { cssVariables } from '@/utils/cssVariables';
import { useToast } from 'vue-toastification';
import { useWorkflowStore } from '@/stores/workflow';
import SvgAddButton from '@/components/atoms/SvgAddButton.vue';

const workflow = useWorkflowStore();

const emit = defineEmits<{
  nodeClicked: [id: string];
  deleteNode: [id: string];
  addComponentRequested: [id?: string];
  addComponentRequestedEdge: [id: string];
}>();

// Hooks
const toast = useToast();

// Data
const editorRef = ref<HTMLElement | null>(null);
const componentRefs = ref<{ objectRef: SVGForeignObjectElement | null }[]>([]);
const viewPort = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

// Computed values
const viewBox = computed(() => {
  return `${viewPort.value.x} ${viewPort.value.y} ${viewPort.value.width} ${viewPort.value.height}`;
});

const lines = computed(() => {
  const lineCoordinates = [];

  workflow.edges.forEach((edge, id) => {
    const sourcePosition = workflow.nodes.get(edge.source);
    const targetPosition = workflow.nodes.get(edge.target);

    if (!sourcePosition || !targetPosition) {
      return;
    }

    const sourceBB = sourcePosition.boundingBox;
    const targetBB = targetPosition.boundingBox;

    const sourceX = sourceBB.x + sourceBB.width / 2;
    const sourceY = sourceBB.y + sourceBB.height;
    const targetX = targetBB.x + targetBB.width / 2;
    const targetY = targetBB.y;

    lineCoordinates.push({
      x1: sourceX,
      y1: sourceY,
      x2: targetX,
      y2: targetY,
      id,
      compatible: edge.compatible,
    });
  });

  return lineCoordinates;
});

const handleScroll = (event: WheelEvent) => {
  event.preventDefault();

  const { deltaX, deltaY, clientX, clientY } = event;
  if (event.ctrlKey) {
    if (!editorRef.value) return;
    const svgWidth = editorRef.value.clientWidth;
    const svgHeight = editorRef.value.clientHeight;
    const svgBoundingRect = editorRef.value.getBoundingClientRect();
    const offsetX = clientX - svgBoundingRect.left;
    const offsetY = clientY - svgBoundingRect.top;

    // Determine the change in width and height (zooming in or out)
    const changeWidth = viewPort.value.width * Math.sign(deltaY) * 0.05;
    const changeHeight = viewPort.value.height * Math.sign(deltaY) * 0.05;

    // Determine the weight of the mouse position in the svg
    // (e.g. if the mouse is in the middle of the svg, the weight is 0.5)
    const weightX = offsetX / svgWidth;
    const weightY = offsetY / svgHeight;

    // Determine the change in x and y (panning)
    const changeX = changeWidth * weightX;
    const changeY = changeHeight * weightY;

    viewPort.value = {
      x: viewPort.value.x - changeX,
      y: viewPort.value.y - changeY,
      width: viewPort.value.width + changeWidth,
      height: viewPort.value.height + changeHeight,
    };

    return;
  }

  viewPort.value = {
    x: viewPort.value.x + deltaX,
    y: viewPort.value.y + deltaY,
    width: viewPort.value.width,
    height: viewPort.value.height,
  };
};

onMounted(() => {
  // Center the viewport fn the workflow
  const x = -((editorRef.value?.clientWidth || 0) / 2 - 240 / 2);
  const y = -((editorRef.value?.clientHeight || 0) / 2 - (workflow.nodes.size * 107) / 2);

  viewPort.value = {
    x,
    y: y > -20 ? -20 : y,
    width: editorRef.value?.clientWidth || 0,
    height: editorRef.value?.clientHeight || 0,
  };
});
</script>

<template>
  <svg ref="editorRef" :viewBox="viewBox" @wheel="handleScroll">
    <g
      v-if="workflow.nodes.size === 0"
      @click="emit('addComponentRequested')"
      @keypress.enter="emit('addComponentRequested')"
    >
      <text text-anchor="middle" dominant-baseline="middle">No nodes in workflow</text>
      <text text-anchor="middle" dominant-baseline="middle" dy="1em">
        Add a node to get started
      </text>
    </g>
    <line
      v-for="(line, index) in lines"
      :x1="line.x1"
      :y1="line.y1"
      :x2="line.x2"
      :y2="line.y2"
      class="component-edge"
      :class="{ 'component-edge--compatible': line.compatible }"
      :key="index"
    />
    <SvgAddButton
      v-for="(line, index) in lines"
      :x="(line.x1 + line.x2) / 2"
      :y="(line.y1 + line.y2) / 2"
      :size="cssVariables.size.m"
      :key="index"
      @click="emit('addComponentRequestedEdge', line.id)"
      @keypress.enter="emit('addComponentRequestedEdge', line.id)"
      tabindex="0"
    />
    <WorkflowForeignObject
      v-for="node in workflow.nodes"
      :y="node[1].boundingBox.y"
      :x="node[1].boundingBox.x"
      :component="node[1]"
      :key="node[0]"
      :id="node[0]"
      @click="emit('nodeClicked', node[0])"
      @delete="emit('deleteNode', node[0])"
      @keypress.enter="emit('nodeClicked', node[0])"
      @requestAddAfter="emit('addComponentRequested', node[0])"
      ref="componentRefs"
      tabindex="0"
    />
  </svg>
</template>

<style lang="scss" scoped>
.component-edge {
  stroke: $error;
  stroke-width: 4;

  &--compatible {
    stroke: $success;
  }
}
</style>
