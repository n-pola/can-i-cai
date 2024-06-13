import Joi from 'joi';
import { SavedWorkflow } from 'cic-shared';
import { objectIdValidation } from './objectIdValidation';

/** Schema to validate a single adjacency entry */
const adjacencyValidationSchema = Joi.object<SavedWorkflow['adjacencies'][0]>({
  id: Joi.string().required(),
  data: Joi.object({
    in: Joi.array().items(Joi.string()).required(),
    out: Joi.array().items(Joi.string()).required(),
  }).required(),
});

/** Schema to validate a single node entry */
const nodeValidationSchema = Joi.object<SavedWorkflow['nodes'][0]>({
  id: Joi.string().required(),
  componentId: objectIdValidation.required(),
});

/** Schema to validate a single custom node entry */
const customNodeValidationSchema = Joi.object<SavedWorkflow['customNodes'][0]>({
  id: Joi.string().required(),
  data: Joi.object({
    name: Joi.string().required(),
    type: Joi.string().valid('input', 'output', 'input-output').required(),
    compatible: Joi.boolean().required(),
    minimalRequiredVersion: Joi.string(),
    additionalInfo: Joi.string(),
    manufacturer: Joi.string().required(),
    category: objectIdValidation.required(),
  }).required(),
});

/** Schema to validate a single edge entry */
const edgeValidationSchema = Joi.object<SavedWorkflow['edges'][0]>({
  id: Joi.string().required(),
  data: Joi.object({
    source: Joi.string().required(),
    target: Joi.string().required(),
  }).required(),
});

/** Schema to validate a to be saved/shared workflow */
export const workflowValidationSchema = Joi.object<SavedWorkflow>({
  name: Joi.string().required(),
  adjacencies: Joi.array().items(adjacencyValidationSchema).required(),
  nodes: Joi.array().items(nodeValidationSchema).required(),
  customNodes: Joi.array().items(customNodeValidationSchema).required(),
  edges: Joi.array().items(edgeValidationSchema).required(),
});
