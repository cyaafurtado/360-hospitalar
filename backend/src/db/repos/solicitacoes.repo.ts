import { query } from '../connection';
import { SolicitacaoRequest, RequestStatus, ContratoInfo } from '../../models/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToReq(r: any): SolicitacaoRequest {
  return {
    id: r.id,
    solicitante: r.solicitante,
    cargo: r.cargo,
    organizacao: r.organizacao,
    tipo: r.tipo,
    status: r.status,
    prestador: r.prestador,
    uf: r.uf,
    cidade: r.cidade,
    email: r.email,
    phone: r.phone,
    quando: r.quando,
    resumo: r.resumo,
    ...(r.servico ? { servico: r.servico } : {}),
    ...(r.prazo ? { prazo: r.prazo } : {}),
    ...(r.contrato ? { contrato: r.contrato as ContratoInfo } : {}),
  };
}

export const SolicitacoesRepo = {
  // Caixa de entrada do fornecedor: só o que foi endereçado à empresa dele.
  async listByPrestador(prestadorId: string): Promise<SolicitacaoRequest[]> {
    const { rows } = await query(
      'SELECT * FROM solicitacoes WHERE prestador_id = $1 ORDER BY created_at ASC',
      [prestadorId]
    );
    return rows.map(rowToReq);
  },

  // Caixa de saída do comprador: o que esta conta enviou.
  async listBySolicitante(usuarioId: string): Promise<SolicitacaoRequest[]> {
    const { rows } = await query(
      'SELECT * FROM solicitacoes WHERE solicitante_usuario_id = $1 ORDER BY created_at ASC',
      [usuarioId]
    );
    return rows.map(rowToReq);
  },

  // Dono dos dois lados, para checar permissão antes de alterar.
  async donos(id: string): Promise<{ prestadorId: string | null; solicitanteUsuarioId: string | null } | null> {
    const { rows } = await query(
      'SELECT prestador_id, solicitante_usuario_id FROM solicitacoes WHERE id = $1',
      [id]
    );
    return rows[0]
      ? { prestadorId: rows[0].prestador_id ?? null, solicitanteUsuarioId: rows[0].solicitante_usuario_id ?? null }
      : null;
  },

  async create(s: {
    id: string;
    solicitante: string;
    cargo: string;
    organizacao: string;
    tipo: string;
    prestador: string;
    prestadorId: string | null;
    uf: string;
    cidade: string;
    email: string;
    phone: string;
    resumo: string;
    solicitanteUsuarioId: string | null;
  }): Promise<SolicitacaoRequest> {
    const { rows } = await query(
      `INSERT INTO solicitacoes
        (id, solicitante, cargo, organizacao, tipo, status, prestador, prestador_id,
         uf, cidade, email, phone, quando, resumo, solicitante_usuario_id)
       VALUES ($1,$2,$3,$4,$5,'nova',$6,$7,$8,$9,$10,$11,'agora',$12,$13)
       RETURNING *`,
      [
        s.id, s.solicitante, s.cargo, s.organizacao, s.tipo, s.prestador, s.prestadorId,
        s.uf, s.cidade, s.email, s.phone, s.resumo, s.solicitanteUsuarioId,
      ]
    );
    return rowToReq(rows[0]);
  },

  async updateStatus(id: string, status: RequestStatus): Promise<SolicitacaoRequest | null> {
    const { rows } = await query(
      'UPDATE solicitacoes SET status = $2 WHERE id = $1 RETURNING *',
      [id, status]
    );
    return rows[0] ? rowToReq(rows[0]) : null;
  },

  async updateContract(id: string, contrato: ContratoInfo): Promise<SolicitacaoRequest | null> {
    const { rows } = await query(
      'UPDATE solicitacoes SET contrato = $2::jsonb WHERE id = $1 RETURNING *',
      [id, JSON.stringify(contrato)]
    );
    return rows[0] ? rowToReq(rows[0]) : null;
  },
};
