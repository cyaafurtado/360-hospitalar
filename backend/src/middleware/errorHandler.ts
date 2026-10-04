import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[Error]', err.message);

  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  // Erro do multer (upload de arquivo) — código vem em inglês, traduz o mais comum.
  if (err.name === 'MulterError') {
    const code = (err as Error & { code?: string }).code;
    const msg = code === 'LIMIT_FILE_SIZE' ? 'Arquivo muito grande para o limite desse envio.' : 'Não foi possível enviar o arquivo.';
    res.status(400).json({ error: msg });
    return;
  }

  res.status(500).json({
    error: process.env.NODE_ENV === 'production' ? 'Erro interno do servidor' : err.message,
  });
}
