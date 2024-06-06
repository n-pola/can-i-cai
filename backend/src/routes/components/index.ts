import { Router } from 'express';
import { getComponent } from './controller/getComponent';
import { getBatchComponents } from './controller/getBatchComponents';

const router = Router();

router.use('/:id', getComponent);
router.use('/', getBatchComponents);

export default router;
