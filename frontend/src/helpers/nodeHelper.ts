import type { FrontendNode } from '../types/workflow';

export class NodeHelper {
  /** Determine if a node is compatible in the current frontend stage */
  static isCompatible(node: FrontendNode): boolean {
    if (node.satisfiesMinimalVersion === undefined) {
      return node.compatible;
    }

    return node.satisfiesMinimalVersion && node.compatible;
  }
}
