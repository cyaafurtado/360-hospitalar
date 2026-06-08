import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Railway injeta PORT automaticamente; API_PORT é fallback local
  port: parseInt(process.env.PORT || process.env.API_PORT || '3001'),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  // Aceita múltiplas origens separadas por vírgula
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim()),
};
