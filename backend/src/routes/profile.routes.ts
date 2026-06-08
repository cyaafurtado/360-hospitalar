import { Router } from 'express';
import { CompaniesController } from '../controllers/companies.controller';

// Perfil do fornecedor logado (mock = medlab; vira autenticado na Parte B)
const router = Router();

router.get('/', CompaniesController.getProfile);
router.put('/', CompaniesController.updateProfile);

export default router;
