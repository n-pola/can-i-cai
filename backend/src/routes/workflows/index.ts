import { Router } from 'express';
import { validateBody } from '@/middlewares/validateBody';
import { workflowValidationSchema } from '@/validators/validateWorkflow';
import { getWorkflow } from './controller/getWorkflow';
import { saveWorkflow } from './controller/saveWorkflow';

const router = Router();

router.get('/:id', getWorkflow);
router.post('/', validateBody(workflowValidationSchema, false), saveWorkflow);

export default router;
