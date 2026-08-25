import { Request, Response, NextFunction } from 'express';
import { verificarAccessToken } from '../services/auth.service';

function lerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  return token.length > 0 ? token : null;
}

// Bloqueia a rota: sem token válido, 401.
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = lerToken(req);
  const payload = token ? verificarAccessToken(token) : null;
  if (!payload) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Entre novamente.' });
    return;
  }
  req.user = payload;
  next();
}

// Não bloqueia: só enriquece a requisição quando o token existe e é válido.
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = lerToken(req);
  const payload = token ? verificarAccessToken(token) : null;
  if (payload) req.user = payload;
  next();
}

// Restringe por tipo de conta (fornecedor x contratante).
export function requireTipo(...tipos: Array<'fornecedor' | 'contratante'>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Sessão expirada ou inválida. Entre novamente.' });
      return;
    }
    if (!tipos.includes(req.user.tipo as 'fornecedor' | 'contratante')) {
      res.status(403).json({ error: 'Sua conta não tem acesso a esta área.' });
      return;
    }
    next();
  };
}

// Painel de administração: só a conta tipo 'admin' entra.
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Sessão expirada ou inválida. Entre novamente.' });
    return;
  }
  if (req.user.tipo !== 'admin') {
    res.status(403).json({ error: 'Sua conta não tem acesso a esta área.' });
    return;
  }
  next();
}
