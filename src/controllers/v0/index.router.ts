import { Router, Request, Response } from 'express';
import { FilterImage } from './filterImage/routes/filterImage.router';
const router: Router = Router();



router.use('/filteredimage', FilterImage);

router.get('/', async (req: Request, res: Response) => {
  res.send(`try sending an image`);
});

export const IndexRouter: Router = router;
