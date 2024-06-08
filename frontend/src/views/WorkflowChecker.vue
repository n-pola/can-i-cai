<script setup lang="ts">
import type { Workflow } from 'cic-shared';
import WorkflowPlane from '@/components/organisms/WorkflowPlane.vue';

const nodes: Workflow['nodes'] = new Map([
  [
    '1',
    {
      name: 'Designer',
      type: 'input-output',
      compatible: true,
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
  <WorkflowPlane :workflow="workflow" class="workflow-plane" />
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
