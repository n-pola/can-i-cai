import { Router } from 'express';
import { getSearch } from './controller/getSearch';

const router = Router();

router.use('/', getSearch);

export default router;
