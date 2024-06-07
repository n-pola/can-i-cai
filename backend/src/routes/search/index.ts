import { Router } from 'express';
import { getSearch } from './controller/getSearch';

const router = Router();

router.get('/', getSearch);

export default router;
