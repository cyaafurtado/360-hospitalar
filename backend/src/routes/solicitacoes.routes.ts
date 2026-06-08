import { Router } from 'express';
import { SolicitacoesController } from '../controllers/solicitacoes.controller';

const router = Router();

router.get('/', SolicitacoesController.list);
router.post('/', SolicitacoesController.create);
router.patch('/:id/status', SolicitacoesController.updateStatus);

export default router;
