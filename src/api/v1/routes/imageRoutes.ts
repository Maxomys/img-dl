import { Request, Router } from 'express';
import { addImage, getImage, getImagesPage } from '../../../handlers/imageHandlers';
import express from 'express';
import { ImageRequestQuery } from '../schema';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './../openapi.json';

const imageRouter = Router();

imageRouter.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

imageRouter.use('/images/static', express.static(process.env.STORAGE_PATH as string));

imageRouter.post('/images', async (req: Request<any, any, any, ImageRequestQuery, any>, res) => {
  if (!req.query.url && typeof !req.query.url !== 'string') {
    res.status(400).send();
    return;
  }

  const apiUrl = `${req.protocol}://${req.get('host')}`;

  const postImageResponse = await addImage(req.query.url, apiUrl);

  res.status(200).json(postImageResponse);
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

  const apiUrl = `${req.protocol}://${req.get('host')}`;

  const imagesPage = await getImagesPage(page, limit, apiUrl);

  res.status(200).json(imagesPage);
});

imageRouter.get('/images/:id', async (req, res) => {
  const apiUrl = `${req.protocol}://${req.get('host')}`;

  const imageResponse = await getImage(parseInt(req.params.id), apiUrl);

  res.status(200).json(imageResponse);
});

export { imageRouter };
