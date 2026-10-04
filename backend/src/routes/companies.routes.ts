import { Router } from 'express';
import { CompaniesController } from '../controllers/companies.controller';
import { FotosController } from '../controllers/fotos.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/', asyncHandler(CompaniesController.list));
// Listar e ver empresa é público (é o diretório); cadastrar exige conta.
router.post('/', requireAuth, asyncHandler(CompaniesController.create));
// Pública e sem token: é a imagem usada direto num <img src>.
router.get('/fotos/:id', asyncHandler(FotosController.view));
router.get('/:id', asyncHandler(CompaniesController.getById));

export default router;
