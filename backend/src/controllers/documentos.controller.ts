import { Request, Response } from 'express';
import { CompaniesRepo } from '../db/repos/companies.repo';
import { DocumentosRepo } from '../db/repos/documentos.repo';
import { UsuariosRepo } from '../db/repos/usuarios.repo';
import { notificarAdminDocumento } from '../services/email.service';
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

// Em análise ou já aprovado: ninguém edita por baixo do pano enquanto um
// admin está (ou já esteve) olhando o que foi enviado.
const BLOQUEADOS_PARA_EDICAO = new Set(['em_analise', 'aprovado']);

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
    if (BLOQUEADOS_PARA_EDICAO.has(doc.status)) {
      res.status(400).json({ error: 'Documento em análise ou já verificado não pode ser editado.' });
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
    if (BLOQUEADOS_PARA_EDICAO.has(doc.status)) {
      res.status(400).json({ error: 'Documento em análise ou já verificado não aceita novos anexos.' });
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
    if (BLOQUEADOS_PARA_EDICAO.has(doc.status)) {
      res.status(400).json({ error: 'Documento em análise ou já verificado não pode ter anexos removidos.' });
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

  // Manda pra fila do admin e avisa por e-mail. Exige pelo menos um arquivo
  // anexado — não faz sentido verificar um documento sem nada pra olhar.
  static async enviarParaAnalise(req: Request, res: Response): Promise<void> {
    const empresa = await empresaDoUsuario(req);
    if (!empresa) {
      res.status(404).json(SEM_EMPRESA);
      return;
    }
    const doc = await DocumentosRepo.getOne(req.params.id);
    if (!doc || doc.companyId !== empresa.id) {
      res.status(404).json({ error: 'Documento não encontrado.' });
      return;
    }
    if (doc.status === 'em_analise') {
      res.status(400).json({ error: 'Este documento já está em análise.' });
      return;
    }
    if (doc.status === 'aprovado') {
      res.status(400).json({ error: 'Este documento já foi verificado.' });
      return;
    }
    const temArquivo = await DocumentosRepo.hasArquivo(doc.id);
    if (!temArquivo) {
      res.status(400).json({ error: 'Anexe um arquivo antes de enviar para verificação.' });
      return;
    }

    await DocumentosRepo.enviarParaAnalise(doc.id);

    const emails = await UsuariosRepo.listEmailsAdmins();
    await notificarAdminDocumento(emails, empresa.name, doc.tipo);

    res.json({ ok: true });
  }

  static async cancelarEnvio(req: Request, res: Response): Promise<void> {
    const doc = await documentoDaEmpresa(req, req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Documento não encontrado.' });
      return;
    }
    const ok = await DocumentosRepo.cancelarEnvio(doc.id);
    if (!ok) {
      res.status(400).json({ error: 'Este documento não está em análise.' });
      return;
    }
    res.json({ ok: true });
  }
}
