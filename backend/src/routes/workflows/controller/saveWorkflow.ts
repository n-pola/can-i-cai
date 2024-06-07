import { WorkflowModel } from '@/helpers/mongoHelper';
import { RequestHandler } from 'express';
import HttpError from '@/types/httpError';

/**
 * Save a workflow to the DB so it can be retrieved later and shared
 * ❗️ Body/workflow should be validated before calling this handler
 */
export const saveWorkflow: RequestHandler = async (req, res, next) => {
  try {
    const workflow = req.body;

    if (!workflow) {
      return res.status(400).send('Workflow is required');
    }

    const newWorkflow = new WorkflowModel(workflow);
    await newWorkflow.save();

    return res.send(newWorkflow);
  } catch (error: HttpError | unknown) {
    if (error instanceof HttpError) return next(error);

    console.error(error);
    return next(new HttpError('Internal Server Error', 500));
  }
};
