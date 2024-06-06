import { Router } from 'express';
import { getAllCategories } from './controller/getAllCategories';
import { getCategory } from './controller/getCategory';

const router = Router();

router.use('/:id', getCategory);
router.use('/', getAllCategories);

export default router;
