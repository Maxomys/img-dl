import { Queue } from 'bullmq';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ImageTable } from '../db/schema';
import { ImageJobData } from '../workers/imageWorker';

const db = drizzle(process.env.DB_URL as string, { casing: 'snake_case' });

const imageQueue = new Queue<ImageJobData>('imageQueue');

export async function handleImagePost(imageUrl: string) {
  const [{ imageId }] = await db
    .insert(ImageTable)
    .values({
      sourceUrl: imageUrl,
      addedAt: new Date()
    })
    .returning({ imageId: ImageTable.id });

  await imageQueue.add('imageDownload', { imageUrl, imageId });

  return imageId;
}
