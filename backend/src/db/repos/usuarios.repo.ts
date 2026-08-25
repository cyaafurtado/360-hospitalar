import { query } from '../connection';
import { Usuario, UsuarioTipo } from '../../models/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToUsuario(r: any): Usuario {
  return {
    id: r.id,
    nome: r.nome,
    email: r.email,
    tipo: r.tipo as UsuarioTipo,
    companyId: r.company_id ?? null,
    organizacao: r.organizacao,
    telefone: r.telefone,
  };
}

// Só o login precisa do hash — o resto da aplicação nunca vê esse campo.
export interface UsuarioComHash extends Usuario {
  senhaHash: string;
  ativo: boolean;
}

export const UsuariosRepo = {
  async findByEmail(email: string): Promise<UsuarioComHash | null> {
    const { rows } = await query('SELECT * FROM usuarios WHERE LOWER(email) = LOWER($1)', [email]);
    if (!rows[0]) return null;
    return { ...rowToUsuario(rows[0]), senhaHash: rows[0].senha_hash, ativo: rows[0].ativo };
  },

  async findById(id: string): Promise<Usuario | null> {
    const { rows } = await query('SELECT * FROM usuarios WHERE id = $1 AND ativo = TRUE', [id]);
    return rows[0] ? rowToUsuario(rows[0]) : null;
  },

  async create(u: {
    id: string;
    nome: string;
    email: string;
    senhaHash: string;
    tipo: UsuarioTipo;
    organizacao: string;
    telefone: string;
    companyId: string | null;
  }): Promise<Usuario> {
    const { rows } = await query(
      `INSERT INTO usuarios (id, nome, email, senha_hash, tipo, organizacao, telefone, company_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [u.id, u.nome, u.email, u.senhaHash, u.tipo, u.organizacao, u.telefone, u.companyId]
    );
    return rowToUsuario(rows[0]);
  },

  async setCompany(usuarioId: string, companyId: string): Promise<void> {
    await query('UPDATE usuarios SET company_id = $1 WHERE id = $2', [companyId, usuarioId]);
  },

  async touchLogin(usuarioId: string): Promise<void> {
    await query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1', [usuarioId]);
  },

  // Painel de admin: toda conta da plataforma, sem o hash da senha.
  async listAll(): Promise<AdminUsuario[]> {
    const { rows } = await query(
      `SELECT id, nome, email, tipo, company_id, organizacao, telefone, ativo, ultimo_login, created_at
         FROM usuarios ORDER BY created_at DESC`
    );
    return rows.map((r) => ({
      id: r.id,
      nome: r.nome,
      email: r.email,
      tipo: r.tipo as UsuarioTipo,
      companyId: r.company_id ?? null,
      organizacao: r.organizacao,
      telefone: r.telefone,
      ativo: r.ativo,
      ultimoLogin: r.ultimo_login,
      createdAt: r.created_at,
    }));
  },

  // Gera uma senha nova para a conta (usada pelo reset do admin). Devolve
  // false se a conta não existe — quem chama decide o hash antes de vir aqui.
  async setSenhaHash(usuarioId: string, senhaHash: string): Promise<boolean> {
    const { rowCount } = await query('UPDATE usuarios SET senha_hash = $2 WHERE id = $1', [usuarioId, senhaHash]);
    return !!rowCount;
  },

  async setAtivo(usuarioId: string, ativo: boolean): Promise<boolean> {
    const { rowCount } = await query('UPDATE usuarios SET ativo = $2 WHERE id = $1', [usuarioId, ativo]);
    return !!rowCount;
  },

  async remove(usuarioId: string): Promise<boolean> {
    const { rowCount } = await query('DELETE FROM usuarios WHERE id = $1', [usuarioId]);
    return !!rowCount;
  },
};

export interface AdminUsuario {
  id: string;
  nome: string;
  email: string;
  tipo: UsuarioTipo;
  companyId: string | null;
  organizacao: string;
  telefone: string;
  ativo: boolean;
  ultimoLogin: Date | null;
  createdAt: Date;
}

// Por que o token morreu. Só 'rotacao' admite reapresentação na janela de tolerância:
// logout e revogação por segurança valem na hora.
export type MotivoRevogacao = 'rotacao' | 'logout' | 'seguranca';

export interface RegistroRefresh {
  id: string;
  usuarioId: string;
  revogadoEm: Date | null;
  motivo: MotivoRevogacao | null;
}

export const RefreshTokensRepo = {
  async save(t: {
    id: string;
    usuarioId: string;
    tokenHash: string;
    expiraEm: Date;
    userAgent: string;
  }): Promise<void> {
    await query(
      `INSERT INTO refresh_tokens (id, usuario_id, token_hash, expira_em, user_agent)
       VALUES ($1,$2,$3,$4,$5)`,
      [t.id, t.usuarioId, t.tokenHash, t.expiraEm, t.userAgent.slice(0, 255)]
    );
  },

  // Só devolve token vivo: não revogado e dentro da validade.
  async findValido(tokenHash: string): Promise<{ id: string; usuarioId: string } | null> {
    const { rows } = await query(
      `SELECT id, usuario_id FROM refresh_tokens
        WHERE token_hash = $1 AND revogado_em IS NULL AND expira_em > NOW()`,
      [tokenHash]
    );
    return rows[0] ? { id: rows[0].id, usuarioId: rows[0].usuario_id } : null;
  },

  // Existe mesmo revogado/expirado — usado para detectar reuso de token roubado.
  async findPorHash(tokenHash: string): Promise<RegistroRefresh | null> {
    const { rows } = await query(
      'SELECT id, usuario_id, revogado_em, motivo FROM refresh_tokens WHERE token_hash = $1',
      [tokenHash]
    );
    return rows[0]
      ? {
          id: rows[0].id,
          usuarioId: rows[0].usuario_id,
          revogadoEm: rows[0].revogado_em ?? null,
          motivo: (rows[0].motivo as MotivoRevogacao) ?? null,
        }
      : null;
  },

  async revogar(id: string, motivo: MotivoRevogacao): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET revogado_em = NOW(), motivo = $2 WHERE id = $1 AND revogado_em IS NULL',
      [id, motivo]
    );
  },

  async revogarPorHash(tokenHash: string, motivo: MotivoRevogacao): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET revogado_em = NOW(), motivo = $2 WHERE token_hash = $1 AND revogado_em IS NULL',
      [tokenHash, motivo]
    );
  },

  // Chamado no logout de todas as sessões e quando detectamos reuso de token.
  async revogarTodosDoUsuario(usuarioId: string, motivo: MotivoRevogacao): Promise<void> {
    await query(
      'UPDATE refresh_tokens SET revogado_em = NOW(), motivo = $2 WHERE usuario_id = $1 AND revogado_em IS NULL',
      [usuarioId, motivo]
    );
  },

  async limparExpirados(): Promise<void> {
    await query("DELETE FROM refresh_tokens WHERE expira_em < NOW() - INTERVAL '30 days'");
  },
};
