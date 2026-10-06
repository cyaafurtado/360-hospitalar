import { query } from '../connection';
import { novoId } from '../../services/auth.service';

export type InstituicaoStatus = 'em_analise' | 'aprovado' | 'rejeitado';

export interface Instituicao {
  id: string;
  usuarioId: string;
  tipo: string;
  name: string;
  cnpj: string;
  cnes: string;
  endereco: string;
  uf: string;
  city: string;
  about: string;
  email: string;
  phone: string;
  status: InstituicaoStatus;
  motivoRejeicao: string;
}

export interface InstituicaoInput {
  tipo: string;
  name: string;
  cnpj: string;
  cnes: string;
  endereco: string;
  uf: string;
  city: string;
  about: string;
  email: string;
  phone: string;
}

// Campos que a própria instituição pode editar depois — CNPJ, CNES, tipo e
// status nunca mudam por aqui: já passaram (ou estão passando) pela análise.
export interface InstituicaoEdicao {
  name: string;
  endereco: string;
  uf: string;
  city: string;
  about: string;
  email: string;
  phone: string;
}

export interface InstituicaoParaAdmin extends Instituicao {
  donoNome: string;
  donoEmail: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToInstituicao(r: any): Instituicao {
  return {
    id: r.id,
    usuarioId: r.usuario_id,
    tipo: r.tipo,
    name: r.name,
    cnpj: r.cnpj,
    cnes: r.cnes,
    endereco: r.endereco,
    uf: r.uf,
    city: r.city,
    about: r.about,
    email: r.email,
    phone: r.phone,
    status: r.status,
    motivoRejeicao: r.motivo_rejeicao,
  };
}

export const InstituicoesRepo = {
  async getByUsuario(usuarioId: string): Promise<Instituicao | null> {
    const { rows } = await query('SELECT * FROM instituicoes WHERE usuario_id = $1', [usuarioId]);
    return rows[0] ? rowToInstituicao(rows[0]) : null;
  },

  // Só a primeira vez: nasce em análise, é isso que dispara o aviso ao admin.
  async create(usuarioId: string, d: InstituicaoInput): Promise<Instituicao> {
    const id = novoId('inst');
    const { rows } = await query(
      `INSERT INTO instituicoes (id, usuario_id, tipo, name, cnpj, cnes, endereco, uf, city, about, email, phone, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'em_analise') RETURNING *`,
      [id, usuarioId, d.tipo, d.name, d.cnpj, d.cnes, d.endereco, d.uf, d.city, d.about, d.email, d.phone]
    );
    return rowToInstituicao(rows[0]);
  },

  async updateDadosBasicos(id: string, d: InstituicaoEdicao): Promise<Instituicao> {
    const { rows } = await query(
      `UPDATE instituicoes SET name = $2, endereco = $3, uf = $4, city = $5, about = $6, email = $7, phone = $8
       WHERE id = $1 RETURNING *`,
      [id, d.name, d.endereco, d.uf, d.city, d.about, d.email, d.phone]
    );
    return rowToInstituicao(rows[0]);
  },

  async aprovar(id: string): Promise<boolean> {
    const { rowCount } = await query(
      "UPDATE instituicoes SET status = 'aprovado', revisado_em = NOW() WHERE id = $1",
      [id]
    );
    return !!rowCount;
  },

  async rejeitar(id: string, motivo: string): Promise<boolean> {
    const { rowCount } = await query(
      "UPDATE instituicoes SET status = 'rejeitado', revisado_em = NOW(), motivo_rejeicao = $2 WHERE id = $1",
      [id, motivo]
    );
    return !!rowCount;
  },

  // Fila do admin: quem está em análise primeiro, depois o histórico.
  async listPendentes(): Promise<InstituicaoParaAdmin[]> {
    const { rows } = await query(
      `SELECT i.*, u.nome AS dono_nome, u.email AS dono_email
         FROM instituicoes i
         JOIN usuarios u ON u.id = i.usuario_id
        ORDER BY (i.status = 'em_analise') DESC, i.created_at DESC`
    );
    return rows.map((r) => ({ ...rowToInstituicao(r), donoNome: r.dono_nome, donoEmail: r.dono_email }));
  },
};
