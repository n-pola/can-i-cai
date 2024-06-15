import type { SavedWorkflow, ShareWorkflowRequest } from 'cic-shared';
import { config } from '@/config';

/**
 * Post a workflow in the proper format for saving to the backend to obtain sharable ID
 * @param workflow - The workflow to share
 */
export const shareWorkflow = async (workflow: SavedWorkflow): Promise<SavedWorkflow> => {
  // Remove id from the workflow
  const body: ShareWorkflowRequest = {
    name: workflow.name,
    nodes: workflow.nodes,
    edges: workflow.edges,
    adjacencies: workflow.adjacencies,
    customNodes: workflow.customNodes,
  };

  const response = await fetch(`${config.api.url}/workflows`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to share workflow');
  }

  return response.json();
};

/**
 * Get a workflow from the backend to reconstruct it in the frontend:w
 * @param id The id of the workflow to get
 */
export const getSharedWorkflow = async (id: string): Promise<SavedWorkflow> => {
  const response = await fetch(`${config.api.url}/workflows/${id}`);

  if (!response.ok) {
    throw new Error('Failed to get shared workflow');
  }

  return response.json();
};
