import { Router } from 'express';
import searchRouter from '@/routes/search';
import componentsRouter from '@/routes/components';
import categoriesRouter from '@/routes/categories';

const apiRouter = Router();

apiRouter.use('/search', searchRouter);
apiRouter.use('/components', componentsRouter);
apiRouter.use('/categories', categoriesRouter);

export default apiRouter;
