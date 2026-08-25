import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth, requireAdmin } from '../middleware/auth';

// Painel de gestão: tudo aqui exige conta tipo 'admin'.
const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/fornecedores', asyncHandler(AdminController.listFornecedores));
router.patch('/fornecedores/:id', asyncHandler(AdminController.updateFornecedor));
router.delete('/fornecedores/:id', asyncHandler(AdminController.deleteFornecedor));

router.get('/usuarios', asyncHandler(AdminController.listUsuarios));
router.post('/usuarios/:id/resetar-senha', asyncHandler(AdminController.resetarSenha));
router.patch('/usuarios/:id/ativo', asyncHandler(AdminController.setAtivo));
router.delete('/usuarios/:id', asyncHandler(AdminController.deleteUsuario));

router.get('/solicitacoes', asyncHandler(AdminController.listSolicitacoes));

export default router;
