import { Router } from 'express';
import { CompaniesController } from '../controllers/companies.controller';
import { asyncHandler } from '../middleware/asyncHandler';

// Perfil do fornecedor logado (mock = medlab; vira autenticado na Parte B)
const router = Router();

router.get('/', asyncHandler(CompaniesController.getProfile));
router.put('/', asyncHandler(CompaniesController.updateProfile));

export default router;
