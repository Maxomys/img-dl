import express from 'express';
import 'dotenv/config';
import { imageRouter } from './api/v1/routes';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const app = express();

app.use(imageRouter);

app.listen(3000, () => {
  console.log(`Listening on port ${PORT}`)
});
