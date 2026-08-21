import { Router } from 'express';
import { CompaniesController } from '../controllers/companies.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth';

// Perfil da empresa da conta logada.
const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(CompaniesController.getProfile));
router.put('/', asyncHandler(CompaniesController.updateProfile));

export default router;
