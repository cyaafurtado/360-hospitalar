import { Request, Response } from 'express';
import {
  CnpjIndisponivel,
  CnpjLimiteExcedido,
  CnpjNaoEncontrado,
  cnpjValido,
  consultarCnpj,
} from '../services/cnpj.service';

export class CnpjController {
  static async consultar(req: Request, res: Response): Promise<void> {
    const cnpj = req.params.cnpj ?? '';

    if (!cnpjValido(cnpj)) {
      res.status(400).json({ error: 'CNPJ inválido. Confira os números digitados.' });
      return;
    }

    try {
      res.json(await consultarCnpj(cnpj));
    } catch (err) {
      if (err instanceof CnpjNaoEncontrado) {
        res.status(404).json({ error: err.message });
        return;
      }
      if (err instanceof CnpjLimiteExcedido) {
        res.status(429).json({ error: err.message });
        return;
      }
      if (err instanceof CnpjIndisponivel) {
        // 503: o problema é do serviço externo, não do que a pessoa digitou.
        // `detalhe` diz qual provedor falhou e como — sem isso, investigar em
        // producao vira adivinhacao.
        res.status(503).json({ error: err.message, detalhe: err.detalhe });
        return;
      }
      throw err;
    }
  }
}
