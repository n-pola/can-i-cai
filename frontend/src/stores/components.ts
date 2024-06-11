import type { PopulatedComponent } from 'cic-shared';
import { defineStore } from 'pinia';
import { getComponent as apiGetComponent, getBatchComponents } from '@/api/components';

interface ComponentsStore {
  components: Map<string, PopulatedComponent>;
}

export const useComponentsStore = defineStore('components', {
  state: (): ComponentsStore => ({
    components: new Map(),
  }),
  actions: {
    async getComponent(id: string): Promise<PopulatedComponent> {
      if (this.components.has(id)) {
        return this.components.get(id)!;
      }

      const component = await apiGetComponent(id);
      this.components.set(id, component);

      return component;
    },
    async getComponents(ids: string[]): Promise<PopulatedComponent[]> {
      const missingIds = ids.filter((id) => !this.components.has(id));
      if (missingIds.length === 0) {
        return ids.map((id) => this.components.get(id)!);
      }

      const { components, missing } = await getBatchComponents(missingIds);
      components.forEach((component) => this.components.set(component.id, component));

      return ids.map((id) => this.components.get(id)!);
    },
    addComponent(component: PopulatedComponent): void {
      this.components.set(component.id, component);
    },
  },
});
