import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import axios from 'axios';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ImageTable } from '../db/schema';
import { eq } from 'drizzle-orm';

const storagePath = process.env.STORAGE_PATH as string;

const db = drizzle(process.env.DB_URL as string, { casing: 'snake_case' });

export function createImageWorker(connection: IORedis): Worker {
  return new Worker(
    'imageQueue',
    async (job: Job<ImageJobData, void>) => {
      try {
        await downloadAndSaveImage(job.data.imageUrl, job.data.imageId);
      } catch (error) {
        console.error(error);
      }
    },
    {
      connection,
      concurrency: 250,
      removeOnComplete: {
        age: 3600, // remove completed jobs older than 1 hour
        count: 100 // keep the last 100 completed jobs
      },
      removeOnFail: {
        age: 24 * 3600 // remove failed jobs older than 24 hours
      }
    }
  )
    .addListener('completed', (job: Job<ImageJobData, void>) => {
      console.log(`${job.data.imageId} has completed!`);
    })
    .addListener('failed', (job: Job<ImageJobData, void>, err) => {
      console.log(`${job.data.imageId} has failed with ${err.message}`);
    });
}

async function downloadAndSaveImage(url: string, id: number): Promise<void> {
  const imageExtension = path.extname(url);
  const localFileName = `${id}${imageExtension}`;
  const localFilePath = path.resolve(storagePath, localFileName);

  try {
    await fs.mkdir(storagePath, { recursive: true });

    const response = await axios.get(url, { responseType: 'stream' });

    const writer = response.data.pipe(createWriteStream(localFilePath));

    return new Promise<void>((resolve, reject) => {
      writer.on('finish', async () => {
        try {
          await db
            .update(ImageTable)
            .set({
              downloadedAt: new Date(),
              localPath: localFilePath
            })
            .where(eq(ImageTable.id, id));

          resolve();
        } catch (dbError) {
          console.error('Error updating database:', dbError);
          reject(dbError);
        }
      });

      writer.on('error', (err: Error) => {
        console.error('Error saving image:', err);
        reject(err);
      });

      response.data.on('error', (err: Error) => {
        console.error('Error downloading image:', err);
        reject(err);
      });
    });
  } catch (error) {
    console.error(`Error downloading or saving image with id: ${id}:`, error);
  }
}

export interface ImageJobData {
  imageUrl: string;
  imageId: number;
}
