import { AuthTokenPayload } from '../models/types';

// Disponibiliza req.user em todas as rotas depois do authMiddleware.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export {};
