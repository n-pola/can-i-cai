import type { FrontendNode } from '@/types/workflow';
import type { PopulatedCustomComponent } from 'cic-shared';

export class NodeHelper {
  /** Determine if a node is compatible in the current frontend stage */
  static isCompatible(node: FrontendNode): boolean {
    if (node.satisfiesMinimalVersion === undefined) {
      return node.compatible;
    }

    return node.satisfiesMinimalVersion && node.compatible;
  }

  /**
   * Create a string to represent the current state of a custom node
   * @param node - Full custom node object
   * @returns String representation
   */
  static calcCustomNodeString(node: FrontendNode | PopulatedCustomComponent): string {
    const nodeString =
      node.name +
      node.type.toString() +
      (node.category?.id ?? '') +
      node.manufacturer +
      (node.compatible ? '1' : '0');

    return nodeString;
  }
}
