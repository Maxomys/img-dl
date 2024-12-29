import { Queue } from 'bullmq';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ImageTable } from '../db/schema';
import { ImageJobData } from '../workers/imageWorker';
import { eq } from 'drizzle-orm';
import { ImageResponse, ImageStatus } from '../api/v1/schema';

const db = drizzle(process.env.DB_URL as string, { casing: 'snake_case' });

const imageQueue = new Queue<ImageJobData>('imageQueue');

export async function addImage(imageUrl: string): Promise<number> {
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

export async function getImage(imageId: number): Promise<ImageResponse> {
  const [image] = await db.select().from(ImageTable).where(eq(ImageTable.id, imageId)).limit(1);

  if (!image) {
    throw new Error('Image not found for id: ' + imageId);
  }

  return {
    status: image.downloadedAt ? ImageStatus.COMPLETED : ImageStatus.PENDING,
    source_url: image.sourceUrl,
    added_at: image.addedAt.toLocaleString(),
    url: '/images/static/' + image.fileName,
    downloaded_at: image.downloadedAt?.toLocaleString() ?? null
  };
}
