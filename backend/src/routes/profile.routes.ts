import { Router } from 'express';
import { CompaniesController } from '../controllers/companies.controller';
import { DocumentosController } from '../controllers/documentos.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth';
import { uploadDocumento } from '../middleware/upload';

// Perfil da empresa da conta logada.
const router = Router();

router.use(requireAuth);
router.get('/', asyncHandler(CompaniesController.getProfile));
router.put('/', asyncHandler(CompaniesController.updateProfile));

// Documentação de verificação: cada ação salva na hora (não espera o Salvar
// geral do perfil — arquivo não dá pra "deixar pendente" só no navegador).
router.post('/documentos', asyncHandler(DocumentosController.create));
router.put('/documentos/:id', asyncHandler(DocumentosController.update));
router.delete('/documentos/:id', asyncHandler(DocumentosController.remove));
router.post('/documentos/:id/arquivos', uploadDocumento.single('arquivo'), asyncHandler(DocumentosController.uploadArquivo));
router.get('/documentos/:id/arquivos/:arquivoId', asyncHandler(DocumentosController.downloadArquivo));
router.delete('/documentos/:id/arquivos/:arquivoId', asyncHandler(DocumentosController.removeArquivo));
router.post('/documentos/:id/enviar', asyncHandler(DocumentosController.enviarParaAnalise));
router.post('/documentos/:id/cancelar', asyncHandler(DocumentosController.cancelarEnvio));

export default router;
