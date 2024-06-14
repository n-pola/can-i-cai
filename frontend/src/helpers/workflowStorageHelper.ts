import { config } from '@/config';
import type { SavedWorkflow } from 'cic-shared';
import type { WorkflowStorageItem } from '@/types/workflow';

const workflowStorageKey = `${config.localStorage.prefix}-workflows`;
const singleWorkflowKeyPrefix = `${config.localStorage.prefix}-workflow-`;

export class WorkflowStorageHelper {
  /**
   * Get a specific workflow by id from local storage
   * @param id - Id of the referenced Workflow
   */
  static getWorkflow(id: string): SavedWorkflow | null {
    const workflow = localStorage.getItem(`${singleWorkflowKeyPrefix}${id}`);
    if (!workflow) {
      return null;
    }

    return JSON.parse(workflow);
  }

  /**
   * Get an overview of all saved workflows
   */
  static getWorkflowStorage(): WorkflowStorageItem[] | null {
    const workflows = localStorage.getItem(workflowStorageKey);
    if (!workflows) {
      return null;
    }

    return JSON.parse(workflows);
  }

  /**
   * Add or update a workflow in the list of all saved workflows
   * @param workflow - Workflow with id, name and date to add or update
   */
  private static addWorkflowToStorage(workflow: WorkflowStorageItem) {
    const workflows = WorkflowStorageHelper.getWorkflowStorage() || [];
    const existingWorkflowIndex = workflows.findIndex((w) => w.id === workflow.id);
    if (existingWorkflowIndex !== -1) {
      workflows[existingWorkflowIndex] = workflow;
    } else {
      workflows.push(workflow);
    }

    localStorage.setItem(workflowStorageKey, JSON.stringify(workflows));
  }

  /**
   * Remove a workflow from the list of all saved workflows
   * @param id - Workflow to remove
   */
  private static removeWorkflowFromStorage(id: string) {
    const workflows = WorkflowStorageHelper.getWorkflowStorage();
    if (!workflows) {
      return;
    }

    const updatedWorkflows = workflows.filter((w) => w.id !== id);
    localStorage.setItem(workflowStorageKey, JSON.stringify(updatedWorkflows));
  }

  /**
   * Save a workflow to local storage
   * @param workflow - Workflow to save in savable format
   */
  static saveWorkflow(workflow: SavedWorkflow): void {
    localStorage.setItem(
      `${config.localStorage.prefix}-workflow-${workflow.id}`,
      JSON.stringify(workflow),
    );
    this.addWorkflowToStorage({
      id: workflow.id,
      name: workflow.name,
      componentCount: workflow.nodes.length + workflow.customNodes.length,
      updateAt: Date.now(),
    });
  }

  /**
   * Remove a workflow from local storage
   * @param id - Id of the workflow to remove
   */
  static removeWorkflow(id: string): void {
    localStorage.removeItem(`${singleWorkflowKeyPrefix}-${id}`);
    this.removeWorkflowFromStorage(id);
  }

  /**
   * Clear all workflows from local storage
   */
  static clearAllWorkflows(): void {
    const workflows = WorkflowStorageHelper.getWorkflowStorage();
    if (!workflows) {
      return;
    }

    workflows.forEach((workflow) => {
      localStorage.removeItem(`${singleWorkflowKeyPrefix}-${workflow.id}`);
    });
    localStorage.removeItem(workflowStorageKey);
  }
}
