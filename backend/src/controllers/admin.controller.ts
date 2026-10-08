import { Request, Response } from 'express';
import { CompaniesRepo } from '../db/repos/companies.repo';
import { UsuariosRepo, RefreshTokensRepo } from '../db/repos/usuarios.repo';
import { SolicitacoesRepo } from '../db/repos/solicitacoes.repo';
import { DocumentosRepo } from '../db/repos/documentos.repo';
import { InstituicoesRepo } from '../db/repos/instituicoes.repo';
import { PlanoEmpresa } from '../models/types';
import { gerarSenhaTemporaria, hashSenha } from '../services/auth.service';

const PLANOS: PlanoEmpresa[] = ['free', 'verified', 'premium'];

export class AdminController {
  /* ---------- Fornecedores ---------- */

  static async listFornecedores(_req: Request, res: Response): Promise<void> {
    res.json(await CompaniesRepo.adminList());
  }

  static async updateFornecedor(req: Request, res: Response): Promise<void> {
    const b = req.body ?? {};
    const verified = typeof b.verified === 'boolean' ? b.verified : undefined;
    const plano = PLANOS.includes(b.plano) ? (b.plano as PlanoEmpresa) : undefined;
    if (verified === undefined && plano === undefined) {
      res.status(400).json({ error: 'Informe verified e/ou plano.' });
      return;
    }
    const c = await CompaniesRepo.updateAdmin(req.params.id, { verified, plano });
    if (!c) {
      res.status(404).json({ error: 'Empresa não encontrada.' });
      return;
    }
    res.json(c);
  }

  static async deleteFornecedor(req: Request, res: Response): Promise<void> {
    const ok = await CompaniesRepo.remove(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Empresa não encontrada.' });
      return;
    }
    res.json({ ok: true });
  }

  /* ---------- Usuários ---------- */

  static async listUsuarios(_req: Request, res: Response): Promise<void> {
    res.json(await UsuariosRepo.listAll());
  }

  // Gera uma senha nova e devolve em texto puro nesta única resposta — não
  // fica guardada em lugar nenhum além do hash. Também derruba as sessões
  // ativas da conta, porque quem tinha a senha antiga não pode continuar logado.
  static async resetarSenha(req: Request, res: Response): Promise<void> {
    const senha = gerarSenhaTemporaria();
    const hash = await hashSenha(senha);
    const ok = await UsuariosRepo.setSenhaHash(req.params.id, hash);
    if (!ok) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    await RefreshTokensRepo.revogarTodosDoUsuario(req.params.id, 'seguranca');
    res.json({ senha });
  }

  static async setAtivo(req: Request, res: Response): Promise<void> {
    const ativo = req.body?.ativo;
    if (typeof ativo !== 'boolean') {
      res.status(400).json({ error: 'Informe ativo (true/false).' });
      return;
    }
    const ok = await UsuariosRepo.setAtivo(req.params.id, ativo);
    if (!ok) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    if (!ativo) await RefreshTokensRepo.revogarTodosDoUsuario(req.params.id, 'seguranca');
    res.json({ ok: true });
  }

  static async deleteUsuario(req: Request, res: Response): Promise<void> {
    if (req.user?.sub === req.params.id) {
      res.status(400).json({ error: 'Você não pode excluir a própria conta pelo painel.' });
      return;
    }
    const ok = await UsuariosRepo.remove(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    res.json({ ok: true });
  }

  /* ---------- Solicitações / contratos ---------- */

  static async listSolicitacoes(_req: Request, res: Response): Promise<void> {
    res.json(await SolicitacoesRepo.adminList());
  }

  /* ---------- Documentos para verificação ---------- */

  static async listDocumentos(_req: Request, res: Response): Promise<void> {
    res.json(await DocumentosRepo.listPendentes());
  }

  static async aprovarDocumento(req: Request, res: Response): Promise<void> {
    const ok = await DocumentosRepo.aprovar(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Documento não encontrado.' });
      return;
    }
    res.json({ ok: true });
  }

  static async rejeitarDocumento(req: Request, res: Response): Promise<void> {
    const motivo = String(req.body?.motivo ?? '').trim();
    const ok = await DocumentosRepo.rejeitar(req.params.id, motivo);
    if (!ok) {
      res.status(404).json({ error: 'Documento não encontrado.' });
      return;
    }
    res.json({ ok: true });
  }

  static async downloadDocumentoArquivo(req: Request, res: Response): Promise<void> {
    const arquivo = await DocumentosRepo.getArquivo(req.params.arquivoId);
    if (!arquivo) {
      res.status(404).json({ error: 'Arquivo não encontrado.' });
      return;
    }
    res.setHeader('Content-Type', arquivo.tipoMime);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(arquivo.nome)}"`);
    res.send(arquivo.conteudo);
  }

  /* ---------- Instituições (verificação de CNPJ/CNES) ---------- */

  static async listInstituicoes(_req: Request, res: Response): Promise<void> {
    res.json(await InstituicoesRepo.listPendentes());
  }

  static async getInstituicao(req: Request, res: Response): Promise<void> {
    const inst = await InstituicoesRepo.getOneParaAdmin(req.params.id);
    if (!inst) {
      res.status(404).json({ error: 'Instituição não encontrada.' });
      return;
    }
    res.json(inst);
  }

  static async aprovarInstituicao(req: Request, res: Response): Promise<void> {
    const ok = await InstituicoesRepo.aprovar(req.params.id);
    if (!ok) {
      res.status(404).json({ error: 'Instituição não encontrada.' });
      return;
    }
    res.json({ ok: true });
  }

  static async rejeitarInstituicao(req: Request, res: Response): Promise<void> {
    const motivo = String(req.body?.motivo ?? '').trim();
    const ok = await InstituicoesRepo.rejeitar(req.params.id, motivo);
    if (!ok) {
      res.status(404).json({ error: 'Instituição não encontrada.' });
      return;
    }
    res.json({ ok: true });
  }
}
