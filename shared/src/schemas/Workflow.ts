import { Schema } from 'mongoose';
import { SavedWorkflow } from '@/types';
import { CustomComponentSchema } from './Component';

/** Schema for nested adjacency object */
const AdjacencySchema = new Schema<SavedWorkflow['adjacencies'][0]>(
  {
    id: {
      type: String,
      required: true,
    },
    data: {
      in: {
        type: [String],
        required: true,
      },
      out: {
        type: [String],
        required: true,
      },
    },
  },
  { _id: false, versionKey: false },
);

/** Schema for nested edge object */
const EdgeSchema = new Schema<SavedWorkflow['edges'][0]>(
  {
    id: {
      type: String,
      required: true,
    },
    data: {
      source: {
        type: String,
        required: true,
      },
      target: {
        type: String,
        required: true,
      },
    },
  },
  { _id: false, versionKey: false },
);

/** Schema for nested custom node object */
const CustomNodeSchema = new Schema<SavedWorkflow['customNodes'][0]>(
  {
    id: {
      type: String,
      required: true,
    },
    data: CustomComponentSchema,
  },
  { _id: false, versionKey: false },
);

/** Schema for a shared workflow */
const WorkflowSchema = new Schema<SavedWorkflow>({
  name: {
    type: String,
    required: true,
  },
  adjacencies: [AdjacencySchema],
  nodes: [
    {
      id: {
        type: String,
        required: true,
      },
      data: {
        componentId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        satisfiesMinimalVersion: {
          type: Boolean,
          required: false,
        },
      },
      _id: false,
    },
  ],
  customNodes: [CustomNodeSchema],
  edges: [EdgeSchema],
});

// enable virtuals
WorkflowSchema.set('toObject', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});
WorkflowSchema.set('toJSON', {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

export const workflowConfig = {
  name: 'Workflow',
  schema: WorkflowSchema,
};
