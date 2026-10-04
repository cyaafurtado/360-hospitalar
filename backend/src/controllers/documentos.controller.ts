import { Request, Response } from 'express';
import { CompaniesRepo } from '../db/repos/companies.repo';
import { DocumentosRepo } from '../db/repos/documentos.repo';
import { Company } from '../models/types';

const SEM_EMPRESA = { error: 'Sua conta ainda não tem empresa cadastrada.', code: 'SEM_EMPRESA' };

async function empresaDoUsuario(req: Request): Promise<Company | null> {
  if (!req.user) return null;
  return CompaniesRepo.getByUsuario(req.user.sub);
}

// Confere que o documento é da empresa de quem está chamando — nunca confia
// só no id que vem na URL.
async function documentoDaEmpresa(req: Request, documentoId: string) {
  const empresa = await empresaDoUsuario(req);
  if (!empresa) return null;
  const doc = await DocumentosRepo.getOne(documentoId);
  if (!doc || doc.companyId !== empresa.id) return null;
  return doc;
}

export class DocumentosController {
  static async create(req: Request, res: Response): Promise<void> {
    const empresa = await empresaDoUsuario(req);
    if (!empresa) {
      res.status(404).json(SEM_EMPRESA);
      return;
    }
    const b = req.body ?? {};
    const doc = await DocumentosRepo.create(
      empresa.id,
      String(b.tipo ?? '').trim(),
      String(b.numero ?? '').trim(),
      String(b.validade ?? '').trim()
    );
    res.status(201).json(doc);
  }

  static async update(req: Request, res: Response): Promise<void> {
    const doc = await documentoDaEmpresa(req, req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Documento não encontrado.' });
      return;
    }
    const b = req.body ?? {};
    await DocumentosRepo.update(
      doc.id,
      String(b.tipo ?? '').trim(),
      String(b.numero ?? '').trim(),
      String(b.validade ?? '').trim()
    );
    res.json({ ok: true });
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const doc = await documentoDaEmpresa(req, req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Documento não encontrado.' });
      return;
    }
    await DocumentosRepo.remove(doc.id);
    res.json({ ok: true });
  }

  static async uploadArquivo(req: Request, res: Response): Promise<void> {
    const doc = await documentoDaEmpresa(req, req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Documento não encontrado.' });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'Selecione um arquivo.' });
      return;
    }
    const arquivo = await DocumentosRepo.addArquivo(doc.id, file.originalname, file.mimetype, file.buffer);
    res.status(201).json(arquivo);
  }

  static async removeArquivo(req: Request, res: Response): Promise<void> {
    const doc = await documentoDaEmpresa(req, req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Documento não encontrado.' });
      return;
    }
    await DocumentosRepo.removeArquivo(req.params.arquivoId);
    res.json({ ok: true });
  }

  static async downloadArquivo(req: Request, res: Response): Promise<void> {
    const doc = await documentoDaEmpresa(req, req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Documento não encontrado.' });
      return;
    }
    const arquivo = await DocumentosRepo.getArquivo(req.params.arquivoId);
    if (!arquivo || arquivo.documentoId !== doc.id) {
      res.status(404).json({ error: 'Arquivo não encontrado.' });
      return;
    }
    res.setHeader('Content-Type', arquivo.tipoMime);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(arquivo.nome)}"`);
    res.send(arquivo.conteudo);
  }
}
