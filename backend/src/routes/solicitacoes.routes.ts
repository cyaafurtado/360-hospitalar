import { Router } from 'express';
import { SolicitacoesController } from '../controllers/solicitacoes.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Toda solicitação pertence a alguém: nenhuma rota aqui é anônima.
router.use(requireAuth);

router.get('/', asyncHandler(SolicitacoesController.list));
router.post('/', asyncHandler(SolicitacoesController.create));
router.get('/:id', asyncHandler(SolicitacoesController.getById));
router.patch('/:id/status', asyncHandler(SolicitacoesController.updateStatus));
router.patch('/:id/contract', asyncHandler(SolicitacoesController.updateContract));

export default router;
