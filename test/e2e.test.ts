import request from 'supertest';
import { drizzle } from 'drizzle-orm/node-postgres';
import { ImageTable } from './../src/db/schema';
import { Pool } from 'pg';
import app from './../src/app';
import { readdir, readFile, unlink } from 'fs/promises';
import http from 'http';
import path from 'path';
import { Server } from 'http';

const testPool = new Pool({ connectionString: process.env.DB_URL as string });
const testDb = drizzle(testPool, { casing: 'snake_case' });

const storagePath = process.env.STORAGE_PATH as string;

describe('Image API E2E Tests', () => {
  const imageUrl = 'http://localhost:8081/puppy.jpg';
  let server: Server;

  beforeAll(async () => {
    // start an http server to serve the test asset
    server = http
      .createServer(async (req, res) => {
        if (req.url === '/puppy.jpg') {
          try {
            const filePath = path.join(process.cwd(), '/test/assets/puppy.jpg');
            const fileContent = await readFile(filePath);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(fileContent);
          } catch (error) {
            console.error('Error serving test image:', error);
            res.writeHead(500);
            res.end('Internal Server Error');
          }
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      })
      .listen(8081);
  });

  beforeEach(async () => {
    // Clean up the database before each test
    await testDb.delete(ImageTable);
  });

  afterEach(async () => {
    // Clean up the storage directory after each test
    const files = await readdir(storagePath);
    for (const file of files) {
      await unlink(path.join(storagePath, file));
    }
  });

  afterAll(async () => {
    await testPool.end();
    server.close();
    console.log('Test server stopped.');
  });

  describe('POST /images', () => {
    it('should download an image and return status URL', async () => {
      const response = await request(app).post('/images').send({ url: imageUrl });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('image_url');

      // wait for the worker to process the job
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // check if the file exists
      const files = await readdir(storagePath);
      expect(files[0]).not.toBe(undefined);
    }, 5000);

    it('should return 400 if URL is missing', async () => {
      const response = await request(app).post('/images').send({});

      expect(response.status).toBe(400);
    });

    it('should return 400 if request body is missing', async () => {
      const response = await request(app).post('/images');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /images/:id', () => {
    it('should return image details if image exists and is downloaded', async () => {
      const fileName = 'image.jpg';
      const [dbImage] = await testDb
        .insert(ImageTable)
        .values({
          sourceUrl: imageUrl,
          addedAt: new Date(),
          downloadedAt: new Date(),
          fileName: fileName
        })
        .returning();

      const response = await request(app).get(`/images/${dbImage.id}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
      expect(response.body.source_url).toBe(imageUrl);
      expect(response.body.added_at).toBeDefined();
      expect(response.body.url).toBeDefined();
      expect(response.body.downloaded_at).toBeDefined();
    });

    it('should return image details if image exists and is pending', async () => {
      const [dbImage] = await testDb
        .insert(ImageTable)
        .values({ sourceUrl: imageUrl, addedAt: new Date() })
        .returning();

      const response = await request(app).get(`/images/${dbImage.id}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('pending');
      expect(response.body.source_url).toBe(imageUrl);
      expect(response.body.added_at).toBeDefined();
      expect(response.body.url).toBeNull();
      expect(response.body.downloaded_at).toBeNull();
    });

    it('should return 404 if image does not exist', async () => {
      const response = await request(app).get('/images/9999');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /images', () => {
    it('should return a page of images', async () => {
      const imageUrl1 = 'https://example.com/image1.jpg';
      const imageUrl2 = 'https://example.com/image2.jpg';

      await testDb.insert(ImageTable).values([
        { sourceUrl: imageUrl1, addedAt: new Date(), downloadedAt: new Date(), fileName: 'image1.jpg' },
        { sourceUrl: imageUrl2, addedAt: new Date() }
      ]);

      const response = await request(app).get('/images');

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.total).toBe(2);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].status).toBe('completed');
      expect(response.body.data[1].status).toBe('pending');
    });

    it('should return a specific page of images with given limit and page number', async () => {
      await testDb.insert(ImageTable).values([
        { sourceUrl: 'https://example.com/image1.jpg', addedAt: new Date() },
        { sourceUrl: 'https://example.com/image2.jpg', addedAt: new Date() },
        { sourceUrl: 'https://example.com/image3.jpg', addedAt: new Date() },
        { sourceUrl: 'https://example.com/image4.jpg', addedAt: new Date() }
      ]);

      const response = await request(app).get('/images?page=2&limit=2');

      expect(response.status).toBe(200);
      expect(response.body.page).toBe(2);
      expect(response.body.pages).toBe(2);
      expect(response.body.limit).toBe(2);
      expect(response.body.total).toBe(4);
      expect(response.body.data.length).toBe(2);
    });

    it('should return empty array if no images are present', async () => {
      const response = await request(app).get('/images');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });
});
