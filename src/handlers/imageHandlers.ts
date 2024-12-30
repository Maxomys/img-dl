import { Queue } from 'bullmq';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ImageTable } from '../db/schema';
import { ImageJobData } from '../workers/imageWorker';
import { asc, count, eq } from 'drizzle-orm';
import { ImageResponse, ImageStatus, Page } from '../api/v1/schema';
import { NotFoundError } from '../errors/apiError';

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

export async function getImage(imageId: number, apiUrl: string): Promise<ImageResponse> {
  const [image] = await db.select().from(ImageTable).where(eq(ImageTable.id, imageId)).limit(1);

  if (!image) {
    throw new NotFoundError();
  }

  return {
    status: image.downloadedAt ? ImageStatus.COMPLETED : ImageStatus.PENDING,
    source_url: image.sourceUrl,
    added_at: image.addedAt.toLocaleString(),
    url: image.downloadedAt ? `${apiUrl}/images/static/${image.fileName}` : null,
    downloaded_at: image.downloadedAt?.toLocaleString() ?? null
  };
}

export async function getImagesPage(page: number, limit: number, apiUrl: string): Promise<Page<ImageResponse>> {
  const images = await db
    .select()
    .from(ImageTable)
    .orderBy(asc(ImageTable.addedAt))
    .limit(limit)
    .offset((page - 1) * limit);

  const [{ totalImagesCount }] = await db.select({ totalImagesCount: count() }).from(ImageTable);

  const imageResponses: ImageResponse[] = images.map((img) => ({
    status: img.downloadedAt ? ImageStatus.COMPLETED : ImageStatus.PENDING,
    source_url: img.sourceUrl,
    added_at: img.addedAt.toLocaleString(),
    url: img.downloadedAt ? `${apiUrl}/images/static/${img.fileName}` : null,
    downloaded_at: img.downloadedAt?.toLocaleString() ?? null
  }));

  return {
    page: page,
    pages: Math.ceil(totalImagesCount / limit),
    limit: limit,
    total: totalImagesCount,
    data: imageResponses
  };
}
