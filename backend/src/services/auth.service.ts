import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthTokenPayload } from '../models/types';

// Access token curto; a renovação vem do refresh token (cookie httpOnly).
const ACCESS_TTL = '15m';
export const REFRESH_TTL_DIAS = 30;
const BCRYPT_COST = 12;

// Não derrubamos a API sem JWT_SECRET (deixaria o site fora do ar); env.ts usa um
// segredo aleatório por processo e avisamos no log de deploy.
if (config.implantado && config.jwtSecretAusente) {
  console.error(
    '[auth] ATENÇÃO: JWT_SECRET não configurado — usando segredo aleatório deste processo. ' +
      'Sessões continuam funcionando via refresh, mas defina JWT_SECRET nas variáveis do Railway.'
  );
}

export function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, BCRYPT_COST);
}

export function conferirSenha(senha: string, hash: string): Promise<boolean> {
  return bcrypt.compare(senha, hash);
}

export function assinarAccessToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: ACCESS_TTL } as SignOptions);
}

export function verificarAccessToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
  } catch {
    return null;
  }
}

// O refresh token é opaco (não é JWT): só existe no cookie e, em hash, no banco.
export function gerarRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function expiracaoRefresh(): Date {
  return new Date(Date.now() + REFRESH_TTL_DIAS * 24 * 60 * 60 * 1000);
}

// Token de confirmação de e-mail: mesma ideia do refresh — opaco, só o hash
// SHA-256 fica salvo, e expira rápido (o link é de uso único e imediato).
const VERIFICACAO_TTL_HORAS = 48;

export function gerarTokenVerificacao(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashTokenVerificacao(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function expiracaoVerificacao(): Date {
  return new Date(Date.now() + VERIFICACAO_TTL_HORAS * 60 * 60 * 1000);
}

// Token de "esqueci a senha": mesma ideia do token de verificação, mas
// validade bem mais curta — é um link que, se vazar, redefine a senha de outra pessoa.
const RECUPERACAO_TTL_MIN = 60;

export function gerarTokenRecuperacao(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashTokenRecuperacao(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function expiracaoRecuperacao(): Date {
  return new Date(Date.now() + RECUPERACAO_TTL_MIN * 60 * 1000);
}

export function novoId(prefixo: string): string {
  return `${prefixo}_${crypto.randomBytes(9).toString('hex')}`;
}

// Sem caracteres ambíguos (0/O, 1/l/I) — é pra alguém digitar à mão.
const ALFABETO_SENHA = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

// Usada só pelo reset de senha do admin: gera uma senha nova para repassar ao
// dono da conta. Nunca fica salva em lugar nenhum além do hash no banco.
export function gerarSenhaTemporaria(tamanho = 14): string {
  const bytes = crypto.randomBytes(tamanho);
  let senha = '';
  for (let i = 0; i < tamanho; i++) senha += ALFABETO_SENHA[bytes[i] % ALFABETO_SENHA.length];
  return senha;
}
