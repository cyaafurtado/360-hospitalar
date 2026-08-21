import { Router } from 'express';
import { SolicitacoesController } from '../controllers/solicitacoes.controller';
import { asyncHandler } from '../middleware/asyncHandler';

const router = Router();

router.get('/', asyncHandler(SolicitacoesController.list));
router.post('/', asyncHandler(SolicitacoesController.create));
router.patch('/:id/status', asyncHandler(SolicitacoesController.updateStatus));
router.patch('/:id/contract', asyncHandler(SolicitacoesController.updateContract));

export default router;
