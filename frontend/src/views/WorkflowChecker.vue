<script setup lang="ts">
import type { Node, Workflow } from 'cic-shared';
import WorkflowPlane from '@/components/organisms/WorkflowPlane.vue';
import { config } from '@/config';
import { onMounted, ref } from 'vue';
import Modal from '@/components/atoms/Modal.vue';
import ComponentDetailModal from '@/components/organisms/ComponentDetailModal.vue';
import AddComponentModal from '@/components/organisms/AddComponentModal.vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

const detailModalIsOpen = ref(false);
const selectedNode = ref<Node | null>(null);

const nodes: Workflow['nodes'] = new Map([
  [
    '1',
    {
      name: 'Designer',
      type: 'input-output',
      compatible: true,
      minimalRequiredVersion: '1.0.0',
      additionalInfo: 'This is a test',
      manufacturer: {
        name: 'Microsoft',
        id: '6663630e4eb7fcc82c3fed6d',
      },
      category: {
        name: {
          de: 'AI-Werkzeuge',
          en: 'AI-Tools',
        },
        icon: 'smart_toy',
        id: '6663630e4eb7fcc82c3fed68',
      },
      id: '6663630e4eb7fcc82c3fed73',
    },
  ],
  [
    '2',
    {
      name: 'Midjourney',
      type: 'output',
      compatible: false,
      manufacturer: {
        name: 'Midjourney',
        id: '6663630e4eb7fcc82c3fed6e',
      },
      category: {
        name: {
          de: 'AI-Werkzeuge',
          en: 'AI-Tools',
        },
        icon: 'smart_toy',
        id: '6663630e4eb7fcc82c3fed68',
      },
      id: '6663630e4eb7fcc82c3fed75',
    },
  ],
  [
    '3',
    {
      name: 'Sora',
      type: 'output',
      compatible: true,
      manufacturer: {
        name: 'OpenAI',
        id: '6663630e4eb7fcc82c3fed6f',
      },
      category: {
        name: {
          de: 'AI-Werkzeuge',
          en: 'AI-Tools',
        },
        icon: 'smart_toy',
        id: '6663630e4eb7fcc82c3fed68',
      },
      id: '6663630e4eb7fcc82c3fed77',
    },
  ],
  [
    '4',
    {
      name: 'DALL·E 3',
      type: 'input-output',
      compatible: true,
      manufacturer: {
        name: 'OpenAI',
        id: '6663630e4eb7fcc82c3fed6f',
      },
      category: {
        name: {
          de: 'AI-Werkzeuge',
          en: 'AI-Tools',
        },
        icon: 'smart_toy',
        id: '6663630e4eb7fcc82c3fed68',
      },
      id: '6663630e4eb7fcc82c3fed79',
    },
  ],
]);

const handleNodeClick = (nodeId: string) => {
  console.log('Node clicked', nodeId);
  const node = nodes.get(nodeId);
  if (!node) throw new Error(`Node with id ${nodeId} not found`);
  selectedNode.value = node;
  detailModalIsOpen.value = true;
};

const workflow: Workflow = {
  name: 'Custom workflow test',
  adjacencies: new Map([
    [
      '1',
      {
        in: [],
        out: ['1'],
      },
    ],
    [
      '2',
      {
        in: ['1'],
        out: ['2'],
      },
    ],
    [
      '3',
      {
        in: ['2'],
        out: ['3'],
      },
    ],
    [
      '4',
      {
        in: ['3'],
        out: [],
      },
    ],
  ]),
  nodes,
  edges: new Map([
    [
      '1',
      {
        source: '1',
        target: '2',
      },
    ],
    [
      '2',
      {
        source: '2',
        target: '3',
      },
    ],
    [
      '3',
      {
        source: '3',
        target: '4',
      },
    ],
  ]),
};
</script>

<template>
  <WorkflowPlane :workflow="workflow" class="workflow-plane" @nodeClicked="handleNodeClick" />
  <ComponentDetailModal
    v-if="selectedNode"
    v-model="detailModalIsOpen"
    :component="selectedNode"
    id="123"
  />
  <AddComponentModal :modelValue="true" @add-component="(id) => toast(id)" />
</template>

<style lang="scss">
.workflow-plane {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
