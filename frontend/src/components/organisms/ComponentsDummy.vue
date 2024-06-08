<script setup lang="ts">
import WorkflowComponent from '@/components/molecules/WorkflowComponent.vue';
import { type PopulatedComponent } from 'cic-shared';

const dummyComponents: PopulatedComponent[] = [
  {
    name: 'M11-P',
    type: 'output',
    compatible: true,
    manufacturer: {
      name: 'Leica',
      id: '123',
    },
    category: {
      name: {
        de: 'Kamera',
        en: 'Camera',
      },
      icon: 'photo_camera',
      id: '123',
    },
    id: '123',
  },
  {
    name: 'Photoshop',
    type: 'input-output',
    compatible: true,
    manufacturer: {
      name: 'Adobe',
      id: '123',
    },
    category: {
      name: {
        de: 'Bearbeitungssoftware',
        en: 'Editing Software',
      },
      icon: 'design_services',
      id: '123',
    },
    id: '123',
  },
];
</script>

<template>
  <WorkflowComponent
    :component="dummyComponents[0]"
    :key="dummyComponents[0].id"
    class="dummy-component"
  />
  <div class="dummy-edge" />
  <WorkflowComponent
    :component="dummyComponents[1]"
    :key="dummyComponents[1].id"
    class="dummy-component"
  />
</template>

<style lang="scss" scoped>
.dummy-component {
  pointer-events: none;
  user-select: none;
}

.dummy-edge {
  width: 4px;
  height: $l;
  margin: 0 auto;
  background-color: $success;
}
</style>
