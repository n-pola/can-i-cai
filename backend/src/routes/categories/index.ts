import { Router } from 'express';
import { validateQuery } from '@/middlewares/validateQuery';
import { validateCategoryQuery } from '@/validators/validateCategoryQuery';
import { validateAllCategoriesQuery } from '@/validators/validateAllCategoriesQuery';
import { getAllCategories } from './controller/getAllCategories';
import { getCategory } from './controller/getCategory';

const router = Router();

router.get('/:id', validateQuery(validateCategoryQuery), getCategory);
router.get('/', validateQuery(validateAllCategoriesQuery), getAllCategories);

export default router;
