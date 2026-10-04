import { Request, Response } from 'express';
import { CompaniesRepo } from '../db/repos/companies.repo';
import { FotosRepo } from '../db/repos/fotos.repo';
import { Company } from '../models/types';

const SEM_EMPRESA = { error: 'Sua conta ainda não tem empresa cadastrada.', code: 'SEM_EMPRESA' };

// Sem selo "Verificada" nem aprovação — a foto é só ilustrativa (fachada,
// instalações), então aparece pro público assim que o fornecedor sobe,
// igual ao resto do perfil (sobre, serviços, catálogo).
const MAX_FOTOS = 10;

async function empresaDoUsuario(req: Request): Promise<Company | null> {
  if (!req.user) return null;
  return CompaniesRepo.getByUsuario(req.user.sub);
}

export class FotosController {
  static async upload(req: Request, res: Response): Promise<void> {
    const empresa = await empresaDoUsuario(req);
    if (!empresa) {
      res.status(404).json(SEM_EMPRESA);
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'Selecione uma foto.' });
      return;
    }
    const total = await FotosRepo.countByCompany(empresa.id);
    if (total >= MAX_FOTOS) {
      res.status(400).json({ error: `Limite de ${MAX_FOTOS} fotos por empresa.` });
      return;
    }
    const foto = await FotosRepo.add(empresa.id, file.originalname, file.mimetype, file.buffer);
    res.status(201).json(foto);
  }

  static async remove(req: Request, res: Response): Promise<void> {
    const empresa = await empresaDoUsuario(req);
    if (!empresa) {
      res.status(404).json(SEM_EMPRESA);
      return;
    }
    const foto = await FotosRepo.getOne(req.params.id);
    if (!foto || foto.companyId !== empresa.id) {
      res.status(404).json({ error: 'Foto não encontrada.' });
      return;
    }
    await FotosRepo.remove(foto.id);
    res.json({ ok: true });
  }

  // Pública e sem autenticação de propósito: é a imagem que vai direto num
  // <img src>, pra qualquer visitante do diretório — não dá pra anexar um
  // token de login a essa tag.
  static async view(req: Request, res: Response): Promise<void> {
    const foto = await FotosRepo.getOne(req.params.id);
    if (!foto) {
      res.status(404).end();
      return;
    }
    res.setHeader('Content-Type', foto.tipoMime);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(foto.conteudo);
  }
}
