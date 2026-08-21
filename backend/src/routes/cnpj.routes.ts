import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { CnpjController } from '../controllers/cnpj.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { requireAuth } from '../middleware/auth';

const router = Router();

// A rota é uma ponte para um serviço externo: exige conta e tem limite próprio,
// para ninguém usar a nossa API como proxy de consulta em massa.
const limitador = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  message: { error: 'Muitas consultas de CNPJ. Aguarde alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get('/:cnpj', requireAuth, limitador, asyncHandler(CnpjController.consultar));

export default router;
