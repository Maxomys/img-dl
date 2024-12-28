import { Request, Router } from 'express';
import { handleImagePost } from '../../handlers/imageHandlers';

const imageRouter = Router();

imageRouter.post('/images', async (req: Request<any, any, { url: string | undefined }, any, any>, res) => {
  if (!req.body || !req.body.url) {
    res.status(400).send();
    return;
  }

  const imageId = await handleImagePost(req.body.url);

  const newImageUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}/${imageId}`;

  res.status(200).json({ image_url: newImageUrl });
});

imageRouter.get('/images', async (req, res) => {});

imageRouter.get('/images/:id', async (req, res) => {});

export { imageRouter };
