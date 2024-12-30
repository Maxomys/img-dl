import { Request, Router } from 'express';
import { addImage, getImage, getImagesPage } from '../../../handlers/imageHandlers';
import express from 'express';

const imageRouter = Router();

imageRouter.post('/images', async (req: Request<any, any, { url: string | undefined }, any, any>, res) => {
  if (!req.body || !req.body.url) {
    res.status(400).send();
    return;
  }

  const imageId = await addImage(req.body.url);

  const newImageUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}/${imageId}`;

  res.status(200).json({ image_url: newImageUrl });
});

imageRouter.get('/images', async (req, res) => {
  let page = 1;
  let limit = 10;

  if (req.query.page && typeof req.query.page === 'string') {
    page = parseInt(req.query.page);
  }
  if (req.query.limit && typeof req.query.limit === 'string') {
    limit = parseInt(req.query.limit);
  }

  const imagesPage = await getImagesPage(page, limit);

  res.status(200).json(imagesPage);
});

imageRouter.use('/images/static/', express.static(process.env.STORAGE_PATH as string));

imageRouter.get('/images/:id', async (req, res) => {
  const imageResponse = await getImage(parseInt(req.params.id));

  res.status(200).json(imageResponse);
});

export { imageRouter };
