import { Request, Response } from 'express';
import { SolicitacoesRepo } from '../db/repos/solicitacoes.repo';
import { CompaniesRepo } from '../db/repos/companies.repo';
import { RequestStatus, ContratoInfo, CancelamentoInfo } from '../models/types';

const VALID_STATUS: RequestStatus[] = ['nova', 'andamento', 'respondida', 'fechada'];

// Depois que o fornecedor respondeu (ou a cotação já fechou), cancelar
// unilateralmente passa a exigir a confirmação da outra parte — até ali,
// qualquer lado cancela direto.
const CANCELAMENTO_PRECISA_APROVACAO: RequestStatus[] = ['respondida', 'fechada'];

type Donos = { prestadorId: string | null; solicitanteUsuarioId: string | null };

// Quem pode mexer numa solicitação: o fornecedor que a recebeu ou a conta que a enviou.
async function podeAlterar(req: Request, solicitacaoId: string): Promise<boolean> {
  if (!req.user) return false;
  const donos = await SolicitacoesRepo.donos(solicitacaoId);
  if (!donos) return false;
  if (donos.solicitanteUsuarioId && donos.solicitanteUsuarioId === req.user.sub) return true;
  if (!donos.prestadorId) return false;
  const empresa = await CompaniesRepo.getByUsuario(req.user.sub);
  return !!empresa && empresa.id === donos.prestadorId;
}

// Mesma checagem de posse, mas devolvendo de qual lado a conta é dona —
// precisamos saber quem pediu o cancelamento pra decidir quem responde.
async function papelDoUsuario(req: Request, donos: Donos): Promise<'fornecedor' | 'contratante' | null> {
  if (!req.user) return null;
  if (donos.solicitanteUsuarioId && donos.solicitanteUsuarioId === req.user.sub) return 'contratante';
  if (donos.prestadorId) {
    const empresa = await CompaniesRepo.getByUsuario(req.user.sub);
    if (empresa && empresa.id === donos.prestadorId) return 'fornecedor';
  }
  return null;
}

export class SolicitacoesController {
  // Detalhe de uma solicitação — só quem é dono consegue ver.
  static async getById(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Entre na sua conta para ver a solicitação.' });
      return;
    }
    if (!(await podeAlterar(req, req.params.id))) {
      res.status(403).json({ error: 'Esta solicitação não é da sua conta.' });
      return;
    }
    const sol = await SolicitacoesRepo.getById(req.params.id);
    if (!sol) {
      res.status(404).json({ error: 'Solicitação não encontrada' });
      return;
    }
    res.json(sol);
  }

  // Duas caixas diferentes na mesma rota: o fornecedor vê o que recebeu, o
  // comprador vê o que enviou. Nunca a lista inteira.
  static async list(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Entre na sua conta para ver as solicitações.' });
      return;
    }
    const caixa = req.query.caixa === 'enviadas' ? 'enviadas' : 'recebidas';

    if (caixa === 'enviadas') {
      res.json(await SolicitacoesRepo.listBySolicitante(req.user.sub));
      return;
    }

    const empresa = await CompaniesRepo.getByUsuario(req.user.sub);
    // Sem empresa não há caixa de entrada — e devolver tudo seria o vazamento.
    res.json(empresa ? await SolicitacoesRepo.listByPrestador(empresa.id) : []);
  }

  // Cria a partir do formulário de orçamento (exige conta: o front já pede login)
  static async create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Entre na sua conta para pedir orçamento.' });
      return;
    }
    // Conta de fornecedor só solicita orçamento (a outros fornecedores) com a
    // própria empresa finalizada. Instituição segue liberada só com login —
    // ainda não existe cadastro de instituição no backend pra checar.
    if (req.user.tipo === 'fornecedor') {
      const minhaEmpresa = await CompaniesRepo.getByUsuario(req.user.sub);
      if (!minhaEmpresa || minhaEmpresa.status !== 'completo') {
        res.status(403).json({ error: 'Finalize o cadastro da sua empresa para solicitar orçamentos.' });
        return;
      }
    }
    const b = req.body ?? {};
    if (!b.solicitante || !b.organizacao || !b.email || !b.detalhes) {
      res.status(400).json({ error: 'Não foi possível identificar seus dados de cadastro. Complete seu perfil e tente novamente.' });
      return;
    }
    let prestadorNome = b.prestador ?? '';
    let prestadorId: string | null = b.prestadorId ?? null;
    if (prestadorId) {
      // getById só enxerga empresa com cadastro completo — pré-cadastro não
      // pode receber pedido de orçamento.
      const c = await CompaniesRepo.getById(prestadorId);
      if (!c) {
        res.status(400).json({ error: 'Este fornecedor ainda não finalizou o cadastro na plataforma.' });
        return;
      }
      prestadorNome = c.name;
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
      solicitanteUsuarioId: req.user.sub,
    });
    res.status(201).json(sol);
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    const { status } = req.body ?? {};
    if (!VALID_STATUS.includes(status)) {
      res.status(400).json({ error: 'Status inválido' });
      return;
    }
    if (!(await podeAlterar(req, req.params.id))) {
      res.status(403).json({ error: 'Esta solicitação não é da sua conta.' });
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
    if (!(await podeAlterar(req, req.params.id))) {
      res.status(403).json({ error: 'Esta solicitação não é da sua conta.' });
      return;
    }
    const updated = await SolicitacoesRepo.updateContract(req.params.id, contrato);
    if (!updated) {
      res.status(404).json({ error: 'Solicitação não encontrada' });
      return;
    }
    res.json(updated);
  }

  // Pede o cancelamento, sempre com motivo. Se o fornecedor ainda não
  // respondeu, cancela na hora; senão, fica pendente da outra parte.
  static async solicitarCancelamento(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Entre na sua conta para cancelar.' });
      return;
    }
    const motivo = String(req.body?.motivo ?? '').trim();
    if (!motivo) {
      res.status(400).json({ error: 'Informe o motivo do cancelamento.' });
      return;
    }
    const donos = await SolicitacoesRepo.donos(req.params.id);
    if (!donos) {
      res.status(404).json({ error: 'Solicitação não encontrada' });
      return;
    }
    const papel = await papelDoUsuario(req, donos);
    if (!papel) {
      res.status(403).json({ error: 'Esta solicitação não é da sua conta.' });
      return;
    }
    const atual = await SolicitacoesRepo.getById(req.params.id);
    if (!atual) {
      res.status(404).json({ error: 'Solicitação não encontrada' });
      return;
    }
    if (atual.status === 'cancelada') {
      res.status(409).json({ error: 'Esta solicitação já está cancelada.' });
      return;
    }
    if (atual.cancelamento?.status === 'pendente') {
      res.status(409).json({ error: 'Já existe um pedido de cancelamento aguardando resposta.' });
      return;
    }
    const precisaAprovacao = CANCELAMENTO_PRECISA_APROVACAO.includes(atual.status);
    const cancelamento: CancelamentoInfo = {
      motivo,
      solicitadoPor: papel,
      em: new Date().toLocaleDateString('pt-BR'),
      status: precisaAprovacao ? 'pendente' : 'aceito',
    };
    const updated = await SolicitacoesRepo.setCancelamento(req.params.id, cancelamento, !precisaAprovacao);
    res.json(updated);
  }

  // Resposta da outra parte a um pedido de cancelamento pendente — só quem
  // não pediu pode aceitar ou recusar.
  static async responderCancelamento(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Entre na sua conta para responder.' });
      return;
    }
    const aceitar = req.body?.aceitar === true;
    const donos = await SolicitacoesRepo.donos(req.params.id);
    if (!donos) {
      res.status(404).json({ error: 'Solicitação não encontrada' });
      return;
    }
    const papel = await papelDoUsuario(req, donos);
    if (!papel) {
      res.status(403).json({ error: 'Esta solicitação não é da sua conta.' });
      return;
    }
    const atual = await SolicitacoesRepo.getById(req.params.id);
    if (!atual?.cancelamento || atual.cancelamento.status !== 'pendente') {
      res.status(409).json({ error: 'Não há pedido de cancelamento pendente.' });
      return;
    }
    if (atual.cancelamento.solicitadoPor === papel) {
      res.status(403).json({ error: 'Quem pediu o cancelamento não pode responder ao próprio pedido.' });
      return;
    }
    const cancelamento: CancelamentoInfo = { ...atual.cancelamento, status: aceitar ? 'aceito' : 'recusado' };
    const updated = await SolicitacoesRepo.setCancelamento(req.params.id, cancelamento, aceitar);
    res.json(updated);
  }
}
