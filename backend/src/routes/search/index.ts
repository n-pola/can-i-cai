import { Router } from 'express';
import { validateQuery } from '@/middlewares/validateQuery';
import { validateSearchQuery } from '@/validators/validateSearchQuery';
import { getSearch } from './controller/getSearch';

const router = Router();

router.get('/', validateQuery(validateSearchQuery), getSearch);

export default router;
