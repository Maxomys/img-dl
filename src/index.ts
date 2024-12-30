import express from 'express';
import 'dotenv/config';
import { imageRouter } from './api/v1/routes/imageRoutes';
import bodyParser from 'body-parser';
import IORedis from 'ioredis';
import { createImageWorker } from './workers/imageWorker';
import { errorHandler } from './middleware/errorHandler';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const connection = new IORedis({ maxRetriesPerRequest: null });

const worker = createImageWorker(connection);

process.on('SIGTERM', async () => {
  await worker.close();
});

export const app = express();

app.use(bodyParser.json());

app.use(imageRouter);

app.use(errorHandler);

app.listen(3000, () => {
  console.log(`Listening on port ${PORT}`);
});
