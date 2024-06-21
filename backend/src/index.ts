import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import errorHandler from '@/middlewares/errorHandler';
import apiRouter from '@/routes';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  }),
);

// Disable x-powered-by header
app.disable('x-powered-by');

app.use(express.json());

app.use('/', apiRouter);

app.use(errorHandler);

const port = process.env.PORT || 3000;

mongoose
  .connect(
    `mongodb://${process.env.DATABASE_USERNAME}:${encodeURIComponent(process.env.DATABASE_PASSWORD ?? '')}@${
      process.env.DATABASE_HOST
    }/${process.env.DATABASE_NAME}?authSource=admin`,
  )
  .then(() => {
    console.log('Connected to the database');
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Can I CAI backend running on port ${port}!`);
    });
  });
