import './config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { optionalAuth } from './middleware/auth';

import authRoutes from './routes/auth.routes';
import cnpjRoutes from './routes/cnpj.routes';
import companiesRoutes from './routes/companies.routes';
import solicitacoesRoutes from './routes/solicitacoes.routes';
import profileRoutes from './routes/profile.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// Railway/Vercel ficam atrás de proxy — necessário para o rate-limit ler o IP real
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // server-to-server / curl
      if (config.corsOrigins.includes(origin)) return cb(null, true);
      if (/\.vercel\.app$/.test(origin)) return cb(null, true);
      if (/^https:\/\/(www\.)?360hospitalar\.com\.br$/.test(origin)) return cb(null, true);
      if (/\.360hospitalar\.com\.br$/.test(origin)) return cb(null, true);
      cb(new Error(`CORS bloqueado: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Identifica quem está chamando quando há token, sem bloquear rota pública.
app.use(optionalAuth);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Muitas requisições, tente novamente em 15 minutos' },
});
app.use('/api', limiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: '360-hospitalar-api', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/cnpj', cnpjRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/requests', solicitacoesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
  console.log(`\n🚀 360 Hospitalar API na porta ${config.port}`);
  console.log(`   Ambiente: ${config.nodeEnv}`);
  console.log(`   Health: http://0.0.0.0:${config.port}/health\n`);
});

export default app;
