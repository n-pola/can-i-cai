import { Router } from 'express';
import { getAllCategories } from './controller/getAllCategories';
import { getCategory } from './controller/getCategory';

const router = Router();

router.get('/:id', getCategory);
router.get('/', getAllCategories);

export default router;
