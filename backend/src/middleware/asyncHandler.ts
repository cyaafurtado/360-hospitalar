import { NextFunction, Request, RequestHandler, Response } from 'express';

// O Express 4 não enxerga promise rejeitada: sem isto, um erro de banco dentro de
// um controller async vira unhandledRejection e derruba o processo inteiro.
// Com o wrapper, o erro vai para o errorHandler e o cliente recebe 500.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
