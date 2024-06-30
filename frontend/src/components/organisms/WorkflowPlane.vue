<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import WorkflowForeignObject from '@/components/molecules/WorkflowForeignObject.vue';
import { cssVariables } from '@/utils/cssVariables';
import { useWorkflowStore } from '@/stores/workflow';
import SvgAddButton from '@/components/atoms/SvgAddButton.vue';
import { NodeHelper } from '@/helpers/nodeHelper';
import type { PlaneMode } from '@/types/checkerPlane';
import { i18n } from '@/utils/i18n';
import { useGlobalStore } from '@/stores/global';

// Component setup
const props = defineProps<{
  mode: PlaneMode;
}>();

const emit = defineEmits<{
  nodeClicked: [id: string];
  deleteNode: [id: string];
  addComponentRequested: [id?: string, place?: 'before' | 'after'];
  addComponentRequestedEdge: [id: string];
}>();

// Hooks
const workflow = useWorkflowStore();
const globalStore = useGlobalStore();

// Data
const editorRef = ref<SVGSVGElement | null>(null);
const componentRefs = ref<InstanceType<typeof WorkflowForeignObject>[]>([]);
const viewPort = ref({
  x: 0,
  y: 0,
  width: 0,
  height: 0,
});

const pointerId = ref<number | null>(null);
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

const handleMouseDown = (event: PointerEvent) => {
  if (
    (props.mode !== 'move' && event.pointerType !== 'touch') ||
    event.target !== editorRef.value ||
    isDragging.value
  ) {
    return;
  }

  isDragging.value = true;
  dragStart.value = new DOMPoint(event.offsetX, event.offsetY);
  pointerId.value = event.pointerId;
};

const handleMouseMove = (event: PointerEvent) => {
  if (
    (props.mode !== 'move' && event.pointerType !== 'touch') ||
    event.target !== editorRef.value ||
    !(pointerId.value === event.pointerId)
  ) {
    return;
  }

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

const handleMouseUp = (event: PointerEvent) => {
  if (pointerId.value !== event.pointerId) return;

  isDragging.value = false;
  dragStart.value = null;
  pointerId.value = null;
};

const centerPlane = () => {
  if (!editorRef.value) return;

  // Wait for next frame if the editor is not visible
  if (editorRef.value.clientWidth === 0 || editorRef.value.clientHeight === 0) {
    requestAnimationFrame(centerPlane);
    return;
  }
  componentRefs.value.forEach((component) => {
    component?.updateMyPosition();
  });

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

  const firstNodeCanHaveInput = workflow.firstNodes.some((node) => {
    const nodeData = workflow.nodes.get(node);
    return nodeData && !(nodeData.type.length === 1 && nodeData.type.includes('output'));
  });

  let maxYOffset = -cssVariables.size.s;

  if (globalStore.isMobile) {
    // Account for toolbar that is now on top on mobile
    maxYOffset = -(cssVariables.size.s * 3 + cssVariables.size.xxs * 2);
  }

  if (firstNodeCanHaveInput) {
    // Add size of add button and its padding
    maxYOffset -= cssVariables.size.l * 2 - cssVariables.size.m;
  }

  viewPort.value = {
    x,
    y: y > maxYOffset ? maxYOffset : y,
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
    @pointerdown="handleMouseDown"
    @pointermove="handleMouseMove"
    @pointerup="handleMouseUp"
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
    <g class="workflow-plane__edge-wrap" v-for="line in workflow.positionedEdges" :key="line.id">
      <line
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
        :x="(line.coordinates.start.x + line.coordinates.end.x) / 2"
        :y="(line.coordinates.start.y + line.coordinates.end.y) / 2"
        :size="cssVariables.size.m"
        @click="emit('addComponentRequestedEdge', line.id)"
        @keypress.enter="emit('addComponentRequestedEdge', line.id)"
        tabindex="0"
        class="workflow-plane__add-button"
      />
    </g>
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
  $self: &;

  touch-action: none;

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

  &__add-button {
    @media (hover: hover) {
      opacity: 0;
    }
  }

  &__edge-wrap {
    padding: 0 $m;
    pointer-events: bounding-box;

    @media (hover: hover) {
      &:hover {
        & #{$self}__add-button {
          opacity: 1;
        }
      }
    }
  }
}
</style>
