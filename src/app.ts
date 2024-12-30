import express from 'express';
import 'dotenv/config';
import { imageRouter } from './api/v1/routes/imageRoutes';
import bodyParser from 'body-parser';
import IORedis from 'ioredis';
import { createImageWorker } from './workers/imageWorker';
import { errorHandler } from './middleware/errorHandler';

const connection = new IORedis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT!),
  maxRetriesPerRequest: null
});

const worker = createImageWorker(connection);

process.on('SIGTERM', async () => {
  connection.disconnect();
  await worker.close();
});

const app = express();

app.use(bodyParser.json());

app.use(imageRouter);

app.use(errorHandler);

export default app;
