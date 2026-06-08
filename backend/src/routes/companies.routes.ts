import { Router } from 'express';
import { CompaniesController } from '../controllers/companies.controller';

const router = Router();

router.get('/', CompaniesController.list);
router.post('/', CompaniesController.create);
router.get('/:id', CompaniesController.getById);

export default router;
