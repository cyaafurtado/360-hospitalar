import { Request, Response } from 'express';
import { InstituicoesRepo } from '../db/repos/instituicoes.repo';

const SEM_INSTITUICAO = {
  error: 'Cadastro da instituição ainda não foi finalizado.',
  code: 'SEM_INSTITUICAO',
};

const TIPOS = ['clinica', 'hosp_priv', 'hosp_pub', 'orgao_pub'];
const TIPOS_COM_CNES = ['clinica', 'hosp_priv', 'hosp_pub'];

export class InstituicoesController {
  // Usado pelo painel pra saber se ainda falta mostrar o aviso de "finalize
  // seu cadastro" — existe a linha, cadastro está completo.
  static async getMine(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Sessão expirada ou inválida. Entre novamente.' });
      return;
    }
    const inst = await InstituicoesRepo.getByUsuario(req.user.sub);
    if (!inst) {
      res.status(404).json(SEM_INSTITUICAO);
      return;
    }
    res.json(inst);
  }

  static async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Sessão expirada ou inválida. Entre novamente.' });
      return;
    }
    const b = req.body ?? {};
    const tipo = String(b.tipo ?? '');
    if (!TIPOS.includes(tipo)) {
      res.status(400).json({ error: 'Tipo de instituição inválido.' });
      return;
    }
    const name = String(b.name ?? '').trim();
    if (!name) {
      res.status(400).json({ error: 'Informe o nome da instituição.' });
      return;
    }
    if (TIPOS_COM_CNES.includes(tipo) && !String(b.cnes ?? '').trim()) {
      res.status(400).json({ error: 'Informe o CNES.' });
      return;
    }

    const inst = await InstituicoesRepo.upsert(req.user.sub, {
      tipo,
      name,
      cnpj: String(b.cnpj ?? '').trim(),
      cnes: String(b.cnes ?? '').trim(),
      uf: String(b.uf ?? '').trim(),
      city: String(b.city ?? '').trim(),
      about: String(b.about ?? '').trim(),
      email: String(b.email ?? '').trim(),
      phone: String(b.phone ?? '').trim(),
    });
    res.status(201).json(inst);
  }
}
