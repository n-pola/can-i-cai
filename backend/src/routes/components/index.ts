import { Router } from 'express';
import { getComponent } from './controller/getComponent';
import { getBatchComponents } from './controller/getBatchComponents';

const router = Router();

router.get('/:id', getComponent);
router.get('/', getBatchComponents);

export default router;
