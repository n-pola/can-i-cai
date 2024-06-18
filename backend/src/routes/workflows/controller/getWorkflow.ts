import { RequestHandler } from 'express';
import HttpError from '@/types/httpError';
import { WorkflowParams } from '@/types/requestTypes';
import { WorkflowModel } from '@/helpers/mongoHelper';
import { SavedWorkflow } from 'cic-shared';

/**
 * Get a single saved workflow from the DB by id
 */
export const getWorkflow: RequestHandler<WorkflowParams> = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new HttpError('Workflow ID is required', 400));
    }

    // Get workflow by ID
    const workflow = await WorkflowModel.findById(id);

    if (!workflow) {
      return next(new HttpError('Workflow not found', 404));
    }

    const response: SavedWorkflow = workflow.toJSON();

    return res.send(response);
  } catch (error: HttpError | unknown) {
    if (error instanceof HttpError) return next(error);

    console.error(error);
    return next(new HttpError('Internal Server Error', 500));
  }
};
