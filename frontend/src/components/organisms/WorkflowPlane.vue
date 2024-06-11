<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { type Edge, type Workflow } from 'cic-shared';
import WorkflowForeignObject from '@/components/molecules/WorkflowForeignObject.vue';
import { cssVariables } from '@/utils/cssVariables';
import { useToast } from 'vue-toastification';

// Component definitions
const props = defineProps<{
  workflow: Workflow;
}>();

const emit = defineEmits<{
  nodeClicked: [id: string];
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

  for (let i = 0; i < componentRefs.value.length - 1; i += 1) {
    const { objectRef: objectRef1 } = componentRefs.value[i];
    const { objectRef: objectRef2 } = componentRefs.value[i + 1];

    // eslint-disable-next-line no-continue
    if (!objectRef1 || !objectRef2) continue;
    const obj1BoundingBox = objectRef1.getBBox();
    const obj2BoundingBox = objectRef2.getBBox();

    const x1 = obj1BoundingBox.x + obj1BoundingBox.width / 2;
    const y1 = obj1BoundingBox.y;
    const x2 = obj2BoundingBox.x + obj2BoundingBox.width / 2;
    const y2 = obj2BoundingBox.y;

    lineCoordinates.push({ x1, y1, x2, y2 });
  }

  return lineCoordinates;
});

const getNodeLevel = (nodeId: string, level = 0): number => {
  const adjacencies = props.workflow.adjacencies.get(nodeId);

  if (!adjacencies) throw new Error(`No adjacencies found for node ${nodeId}`);

  if (adjacencies.in.length === 0) return level;

  const inEdges = adjacencies.in
    .map((edge) => props.workflow.edges.get(edge))
    .filter((edge) => edge !== undefined) as Edge[];

  const lowerNodeLevels = inEdges.map((edge) => getNodeLevel(edge.source, level + 1));

  return Math.max(...lowerNodeLevels);
};

const getComponentPosition = (nodeId: string) => {
  const level = getNodeLevel(nodeId);
  const componentPositionSpace =
    cssVariables.size.xxs * 2 + cssVariables.font.m + cssVariables.font.s + cssVariables.size.m;

  return {
    x: 0,
    y: componentPositionSpace * level,
  };
};

const handleScroll = (event: WheelEvent) => {
  event.preventDefault();

  const { deltaX, deltaY, clientX, clientY } = event;
  console.log(event);
  if (event.ctrlKey) {
    if (!editorRef.value) return;
    const svgWidth = editorRef.value.clientWidth;
    const svgHeight = editorRef.value.clientHeight;
    const svgBoundingRect = editorRef.value.getBoundingClientRect();
    console.log(svgBoundingRect);
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
  const y = -((editorRef.value?.clientHeight || 0) / 2 - (props.workflow.nodes.size * 107) / 2);

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
    <line
      v-for="(line, index) in lines"
      :x1="line.x1"
      :y1="line.y1"
      :x2="line.x2"
      :y2="line.y2"
      stroke="black"
      class="component-edge"
      :key="index"
    />
    <WorkflowForeignObject
      v-for="node in workflow.nodes"
      :y="getComponentPosition(node[0]).y"
      :component="node[1]"
      :key="node[0]"
      @click="emit('nodeClicked', node[0])"
      @delete="toast.error(`delete ${node[0]} requested`)"
      @keypress.enter="emit('nodeClicked', node[0])"
      ref="componentRefs"
      tabindex="0"
    />
  </svg>
</template>

<style lang="scss" scoped>
.component-edge {
  stroke: $success;
  stroke-width: 4;
}
</style>
