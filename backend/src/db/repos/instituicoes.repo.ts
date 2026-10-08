import { query } from '../connection';
import { novoId } from '../../services/auth.service';

export type InstituicaoStatus = 'em_analise' | 'aprovado' | 'rejeitado';

// Cada responsável (cadastro / técnico) é uma pessoa de contato própria —
// nem sempre é quem preencheu o formulário.
export interface ResponsavelInput {
  nome: string;
  email: string;
  telefone: string;
}

export interface Instituicao {
  id: string;
  usuarioId: string;
  tipo: string;
  name: string;
  razaoSocial: string;
  nomeFantasia: string;
  naturezaJuridica: string;
  cnpj: string;
  cnes: string;
  endereco: string;
  uf: string;
  city: string;
  about: string;
  email: string;
  phone: string;
  emailFinanceiro: string;
  respCadastro: ResponsavelInput;
  respTecnico: ResponsavelInput;
  status: InstituicaoStatus;
  motivoRejeicao: string;
}

export interface InstituicaoInput {
  tipo: string;
  name: string;
  razaoSocial: string;
  nomeFantasia: string;
  naturezaJuridica: string;
  cnpj: string;
  cnes: string;
  endereco: string;
  uf: string;
  city: string;
  about: string;
  email: string;
  phone: string;
  emailFinanceiro: string;
  respCadastro: ResponsavelInput;
  respTecnico: ResponsavelInput;
}

// Campos que a própria instituição pode editar depois — CNPJ, CNES, tipo e
// status nunca mudam por aqui: já passaram (ou estão passando) pela análise.
export interface InstituicaoEdicao {
  name: string;
  razaoSocial: string;
  nomeFantasia: string;
  naturezaJuridica: string;
  endereco: string;
  uf: string;
  city: string;
  about: string;
  email: string;
  phone: string;
  emailFinanceiro: string;
  respCadastro: ResponsavelInput;
  respTecnico: ResponsavelInput;
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
    razaoSocial: r.razao_social,
    nomeFantasia: r.nome_fantasia,
    naturezaJuridica: r.natureza_juridica,
    cnpj: r.cnpj,
    cnes: r.cnes,
    endereco: r.endereco,
    uf: r.uf,
    city: r.city,
    about: r.about,
    email: r.email,
    phone: r.phone,
    emailFinanceiro: r.email_financeiro,
    respCadastro: { nome: r.resp_cadastro_nome, email: r.resp_cadastro_email, telefone: r.resp_cadastro_telefone },
    respTecnico: { nome: r.resp_tecnico_nome, email: r.resp_tecnico_email, telefone: r.resp_tecnico_telefone },
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
      `INSERT INTO instituicoes (
         id, usuario_id, tipo, name, razao_social, nome_fantasia, natureza_juridica,
         cnpj, cnes, endereco, uf, city, about, email, phone, email_financeiro,
         resp_cadastro_nome, resp_cadastro_email, resp_cadastro_telefone,
         resp_tecnico_nome, resp_tecnico_email, resp_tecnico_telefone, status
       )
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,'em_analise')
       RETURNING *`,
      [
        id, usuarioId, d.tipo, d.name, d.razaoSocial, d.nomeFantasia, d.naturezaJuridica,
        d.cnpj, d.cnes, d.endereco, d.uf, d.city, d.about, d.email, d.phone, d.emailFinanceiro,
        d.respCadastro.nome, d.respCadastro.email, d.respCadastro.telefone,
        d.respTecnico.nome, d.respTecnico.email, d.respTecnico.telefone,
      ]
    );
    return rowToInstituicao(rows[0]);
  },

  async updateDadosBasicos(id: string, d: InstituicaoEdicao): Promise<Instituicao> {
    const { rows } = await query(
      `UPDATE instituicoes SET
         name = $2, razao_social = $3, nome_fantasia = $4, natureza_juridica = $5,
         endereco = $6, uf = $7, city = $8, about = $9, email = $10, phone = $11, email_financeiro = $12,
         resp_cadastro_nome = $13, resp_cadastro_email = $14, resp_cadastro_telefone = $15,
         resp_tecnico_nome = $16, resp_tecnico_email = $17, resp_tecnico_telefone = $18
       WHERE id = $1 RETURNING *`,
      [
        id, d.name, d.razaoSocial, d.nomeFantasia, d.naturezaJuridica,
        d.endereco, d.uf, d.city, d.about, d.email, d.phone, d.emailFinanceiro,
        d.respCadastro.nome, d.respCadastro.email, d.respCadastro.telefone,
        d.respTecnico.nome, d.respTecnico.email, d.respTecnico.telefone,
      ]
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

  // Página de verificação do admin: uma instituição só, com quem é o dono da conta.
  async getOneParaAdmin(id: string): Promise<InstituicaoParaAdmin | null> {
    const { rows } = await query(
      `SELECT i.*, u.nome AS dono_nome, u.email AS dono_email
         FROM instituicoes i
         JOIN usuarios u ON u.id = i.usuario_id
        WHERE i.id = $1`,
      [id]
    );
    return rows[0] ? { ...rowToInstituicao(rows[0]), donoNome: rows[0].dono_nome, donoEmail: rows[0].dono_email } : null;
  },
};
