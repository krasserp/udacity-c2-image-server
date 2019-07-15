import { Router, Request, Response } from 'express';
const HttpStatus = require('http-status-codes');
const isImageUrl = require('is-image-url');

const router: Router = Router();

router.get('/', async (req: Request, res: Response) => {
  let { image_url } = req.query;
  if (!image_url) {
    res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .send({ err: 'image_url query parameter missing' });
      return;
  }
  if (!isImageUrl(image_url)) {
    res
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .send({ err: 'image_url is not pointing to a image file' });
      return;
  }
  res.status(HttpStatus.OK).send(req.query);
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  res.send(req.params);
});

export const FilterImage: Router = router;
