import { Router } from 'express';
import searchRouter from '@/routes/search';
import componentsRouter from '@/routes/components';
import categoriesRouter from '@/routes/categories';
import workflowsRouter from '@/routes/workflows';

const apiRouter = Router();

apiRouter.use('/search', searchRouter);
apiRouter.use('/components', componentsRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/workflows', workflowsRouter);

export default apiRouter;
