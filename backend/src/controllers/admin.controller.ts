import { Request, Response } from 'express';
import { CompaniesRepo } from '../db/repos/companies.repo';
import { UsuariosRepo, RefreshTokensRepo } from '../db/repos/usuarios.repo';
import { SolicitacoesRepo } from '../db/repos/solicitacoes.repo';
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
}
