<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import WorkflowForeignObject from '@/components/molecules/WorkflowForeignObject.vue';
import { cssVariables } from '@/utils/cssVariables';
import { useWorkflowStore } from '@/stores/workflow';
import SvgAddButton from '@/components/atoms/SvgAddButton.vue';
import { NodeHelper } from '@/helpers/nodeHelper';
import type { PlaneMode } from '@/types/checkerPlane';
import { i18n } from '../../utils/i18n';

const workflow = useWorkflowStore();

const props = defineProps<{
  mode: PlaneMode;
}>();

const emit = defineEmits<{
  nodeClicked: [id: string];
  deleteNode: [id: string];
  addComponentRequested: [id?: string, place?: 'before' | 'after'];
  addComponentRequestedEdge: [id: string];
}>();

// Data
const editorRef = ref<SVGSVGElement | null>(null);
const componentRefs = ref<{ objectRef: SVGForeignObjectElement | null }[]>([]);
const viewPort = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

const isDragging = ref(false);
const dragStart = ref<DOMPoint | null>(null);

// Computed values
const viewBox = computed(() => {
  return `${viewPort.value.x} ${viewPort.value.y} ${viewPort.value.width} ${viewPort.value.height}`;
});

/** Scale between user coordinate space and svg coordinate space */
const scale = computed(() => {
  if (!editorRef.value) return 1;
  return viewPort.value.width / editorRef.value.width.baseVal.value;
});

const cursor = computed(() => {
  if (isDragging.value) return 'grabbing';

  return props.mode === 'move' ? 'grab' : 'default';
});

// Functions
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

const handleMouseDown = (event: MouseEvent) => {
  if (props.mode !== 'move' || event.target !== editorRef.value) return;

  isDragging.value = true;
  dragStart.value = new DOMPoint(event.offsetX, event.offsetY);
};

const handleMouseMove = (event: MouseEvent) => {
  if (props.mode !== 'move' || event.target !== editorRef.value) return;

  if (!isDragging.value || !dragStart.value) return;

  const { offsetX, offsetY } = event;
  const changeX = (dragStart.value.x - offsetX) * scale.value;
  const changeY = (dragStart.value.y - offsetY) * scale.value;

  viewPort.value = {
    x: viewPort.value.x + changeX,
    y: viewPort.value.y + changeY,
    width: viewPort.value.width,
    height: viewPort.value.height,
  };

  dragStart.value = new DOMPoint(offsetX, offsetY);
};

const handleMouseUp = () => {
  isDragging.value = false;
  dragStart.value = null;
};

const centerPlane = () => {
  if (!editorRef.value) return;

  // Bring 0,0 to the center of the screen
  let x = -((editorRef.value.clientWidth || 0) / 2);
  let y = -((editorRef.value.clientHeight || 0) / 2);

  // If there are nodes, center the plane around them
  if (workflow.nodes.size) {
    let maxNodeWidth = 0;
    let maxNodeY = 0;

    workflow.nodes.forEach((node) => {
      if (node.boundingBox.width > maxNodeWidth) {
        maxNodeWidth = node.boundingBox.width;
      }

      const nodeY = node.boundingBox.y + node.boundingBox.height;

      if (nodeY > maxNodeY) {
        maxNodeY = nodeY;
      }
    });

    x -= -maxNodeWidth / 2;
    y += maxNodeY / 2;
  }

  viewPort.value = {
    x,
    y: y > -20 ? -20 : y,
    width: editorRef.value.clientWidth || 0,
    height: editorRef.value.clientHeight || 0,
  };
};

watch(workflow.nodes, (value) => {
  if (value.size === 0) {
    centerPlane();
  }
});

// Lifecycle hooks
onMounted(() => {
  centerPlane();
});

defineExpose({
  centerPlane,
});
</script>

<template>
  <svg
    ref="editorRef"
    :viewBox="viewBox"
    @wheel="handleScroll"
    class="workflow-plane"
    :style="{ cursor }"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
  >
    <g
      v-if="workflow.nodes.size === 0"
      @click="emit('addComponentRequested')"
      @keypress.enter="emit('addComponentRequested')"
      tabindex="0"
      class="workflow-plane__add-first-component"
    >
      <SvgAddButton :x="0" :y="0" :size="cssVariables.size.xxl" />
      <text
        text-anchor="middle"
        dominant-baseline="middle"
        :y="cssVariables.size.xxl / 2 + cssVariables.size.s"
      >
        {{ i18n.t('addFirstComponent') }}
      </text>
    </g>
    <line
      v-for="line in workflow.positionedEdges"
      :x1="line.coordinates.start.x"
      :y1="line.coordinates.start.y"
      :x2="line.coordinates.end.x"
      :y2="line.coordinates.end.y"
      class="workflow-plane__edge"
      :class="{
        'workflow-plane__edge--compatible': line.compatible === 'yes',
        'workflow-plane__edge--partial': line.compatible === 'partial',
      }"
      :key="line.id"
    />
    <SvgAddButton
      v-for="(line, index) in workflow.positionedEdges"
      :x="(line.coordinates.start.x + line.coordinates.end.x) / 2"
      :y="(line.coordinates.start.y + line.coordinates.end.y) / 2"
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
      :compatible="NodeHelper.isCompatible(node[1])"
      :key="node[0]"
      :id="node[0]"
      @click="emit('nodeClicked', node[0])"
      @delete="emit('deleteNode', node[0])"
      @keypress.enter="emit('nodeClicked', node[0])"
      @requestAddAfter="emit('addComponentRequested', node[0], 'after')"
      @requestAddBefore="emit('addComponentRequested', node[0], 'before')"
      @recenter-plane="centerPlane"
      ref="componentRefs"
      tabindex="0"
    />
  </svg>
</template>

<style lang="scss" scoped>
.workflow-plane {
  & g {
    transition: $animation;
  }

  &__add-first-component {
    cursor: pointer;
  }

  &__edge {
    stroke: $error;
    stroke-width: 4;

    &--compatible {
      stroke: $success;
    }

    &--partial {
      stroke: $warning;
    }
  }
}
</style>
