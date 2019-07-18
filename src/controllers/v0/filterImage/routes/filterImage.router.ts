import { Router, Request, Response } from 'express';
const HttpStatus = require('http-status-codes');
const isImageUrl = require('is-image-url');

import { deleteLocalFiles, filterImageWithPython } from '../../../../util/util';

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
  try {
    // array of strings 1st is the modified img 2nd the downloaded img path
    const imgPaths: string[] = await filterImageWithPython(image_url);
    res.status(HttpStatus.OK).sendFile(imgPaths[0], err => {
      if (err) {
        console.log(err);
      } else {
        deleteLocalFiles(imgPaths);
      }
    });
  } catch (err) {
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .send({ err, message: 'A issue ocurred during the image processing :(' });
  }
});

export const FilterImage: Router = router;
