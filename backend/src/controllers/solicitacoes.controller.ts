import { Request, Response } from 'express';
import { SolicitacoesRepo } from '../db/repos/solicitacoes.repo';
import { CompaniesRepo } from '../db/repos/companies.repo';
import { RequestStatus, ContratoInfo } from '../models/types';

const VALID_STATUS: RequestStatus[] = ['nova', 'andamento', 'respondida', 'fechada'];

export class SolicitacoesController {
  // Lista as solicitações do fornecedor logado (mock = medlab)
  static async list(req: Request, res: Response): Promise<void> {
    const prestadorId = (req.query.prestador as string) || undefined;
    res.json(await SolicitacoesRepo.listByPrestador(prestadorId));
  }

  // Cria a partir do formulário de orçamento (público)
  static async create(req: Request, res: Response): Promise<void> {
    const b = req.body ?? {};
    if (!b.solicitante || !b.organizacao || !b.email || !b.detalhes) {
      res.status(400).json({ error: 'Campos obrigatórios: solicitante, organizacao, email, detalhes' });
      return;
    }
    let prestadorNome = b.prestador ?? '';
    let prestadorId: string | null = b.prestadorId ?? null;
    if (prestadorId) {
      const c = await CompaniesRepo.getById(prestadorId);
      if (c) prestadorNome = c.name;
    }
    const id = 'SOL-' + Math.floor(2050 + Math.random() * 900);
    const resumo = b.servico ? `${b.servico} — ${b.detalhes}` : b.detalhes;
    const sol = await SolicitacoesRepo.create({
      id,
      solicitante: b.solicitante,
      cargo: b.cargo ?? '',
      organizacao: b.organizacao,
      tipo: ['cotacao', 'contato', 'parceria'].includes(b.tipo) ? b.tipo : 'cotacao',
      prestador: prestadorNome,
      prestadorId,
      uf: b.uf ?? '',
      cidade: b.cidade ?? '',
      email: b.email,
      phone: b.telefone ?? b.phone ?? '',
      resumo,
    });
    res.status(201).json(sol);
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.body ?? {};
    if (!VALID_STATUS.includes(status)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }
    const updated = await SolicitacoesRepo.updateStatus(req.params.id, status);
    if (!updated) {
      res.status(404).json({ error: 'Solicitação não encontrada' });
      return;
    }
    res.json(updated);
  }

  static async updateContract(req: Request, res: Response): Promise<void> {
    const contrato = req.body?.contrato as ContratoInfo | undefined;
    if (!contrato || typeof contrato.assinado !== 'boolean') {
      res.status(400).json({ error: 'Campo contrato inválido' });
      return;
    }
    const updated = await SolicitacoesRepo.updateContract(req.params.id, contrato);
    if (!updated) {
      res.status(404).json({ error: 'Solicitação não encontrada' });
      return;
    }
    res.json(updated);
  }
}
