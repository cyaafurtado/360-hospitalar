import { Router } from 'express';
import { CompaniesController } from '../controllers/companies.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(CompaniesController.list));
router.post('/', asyncHandler(CompaniesController.create));
router.get('/:id', asyncHandler(CompaniesController.getById));

export default router;
