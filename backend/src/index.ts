import express from 'express';
import cors from 'cors';
import { CategorySchema } from 'cic-shared';
import mongoose from 'mongoose';

const app = express();
const Category = mongoose.model('Category', CategorySchema);

app.use(
  cors({
    origin:
      (process.env.CORS_ORIGIN && new RegExp(process.env.CORS_ORIGIN)) || '*',
  }),
);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/categories', async (req, res) => {
  const categories = await Category.find();

  res.json(categories);
});

const port = process.env.PORT || 3000;

mongoose
  .connect(
    `mongodb://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${
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
