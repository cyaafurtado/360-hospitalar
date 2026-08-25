import { getClient, query } from '../connection';
import { Company, PlanoEmpresa } from '../../models/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToCompany(r: any): Company {
  return {
    id: r.id,
    name: r.name,
    segment: r.segment,
    tagline: r.tagline,
    city: r.city,
    uf: r.uf,
    rating: Number(r.rating),
    reviews: Number(r.reviews),
    verified: r.verified,
    founded: Number(r.founded),
    employees: r.employees,
    services: r.services ?? [],
    badges: r.badges ?? [],
    about: r.about,
    phone: r.phone,
    site: r.site,
    email: r.email ?? null,
    atendeUfs: r.atende_ufs ?? [],
    status: r.status,
    plano: r.plano,
  };
}

// Visão do painel de admin: toda empresa (qualquer status), com quem administra.
export interface AdminCompany extends Company {
  usuarioId: string | null;
  donoNome: string | null;
  donoEmail: string | null;
  createdAt: string;
}

function rowToAdminCompany(r: any): AdminCompany {
  return {
    ...rowToCompany(r),
    usuarioId: r.usuario_id ?? null,
    donoNome: r.dono_nome ?? null,
    donoEmail: r.dono_email ?? null,
    createdAt: r.created_at,
  };
}

export interface NovaEmpresa {
  id: string;
  name: string;
  segment: string;
  tagline: string;
  city: string;
  uf: string;
  founded: number;
  employees: string;
  services: string[];
  badges: string[];
  about: string;
  phone: string;
  site: string;
  email: string | null;
  atendeUfs: string[];
}

export const CompaniesRepo = {
  // Diretório público: só empresa com cadastro completo aparece pra quem busca
  // ou pede orçamento. Pré-cadastro é visível só pra própria conta (getByUsuario).
  async list(): Promise<Company[]> {
    const { rows } = await query("SELECT * FROM companies WHERE status = 'completo' ORDER BY rating DESC");
    return rows.map(rowToCompany);
  },

  async getById(id: string): Promise<Company | null> {
    const { rows } = await query("SELECT * FROM companies WHERE id = $1 AND status = 'completo'", [id]);
    return rows[0] ? rowToCompany(rows[0]) : null;
  },

  async create(c: NovaEmpresa): Promise<Company> {
    const { rows } = await query(
      `INSERT INTO companies
        (id, name, segment, tagline, city, uf, rating, reviews, verified,
         founded, employees, services, badges, about, phone, site, email, atende_ufs)
       VALUES ($1,$2,$3,$4,$5,$6,0,0,FALSE,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING *`,
      [
        c.id, c.name, c.segment, c.tagline, c.city, c.uf,
        c.founded, c.employees, c.services, c.badges, c.about,
        c.phone, c.site, c.email, c.atendeUfs,
      ]
    );
    return rowToCompany(rows[0]);
  },

  // Empresa administrada por esta conta. É a fonte da verdade da posse: nunca
  // confiamos no companyId que veio dentro do token, que pode estar velho.
  async getByUsuario(usuarioId: string): Promise<Company | null> {
    const { rows } = await query('SELECT * FROM companies WHERE usuario_id = $1', [usuarioId]);
    return rows[0] ? rowToCompany(rows[0]) : null;
  },

  // Cria a empresa e amarra na conta no mesmo commit: nunca sobra empresa sem
  // dono nem conta apontando para empresa que não existe. Toda empresa nasce
  // em pré-cadastro; updateProfile() é quem promove pra 'completo'.
  async createParaUsuario(c: NovaEmpresa, usuarioId: string): Promise<Company> {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const { rows } = await client.query(
        `INSERT INTO companies
          (id, name, segment, tagline, city, uf, rating, reviews, verified,
           founded, employees, services, badges, about, phone, site, email, atende_ufs, usuario_id, status)
         VALUES ($1,$2,$3,$4,$5,$6,0,0,FALSE,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'pre_cadastro')
         RETURNING *`,
        [
          c.id, c.name, c.segment, c.tagline, c.city, c.uf,
          c.founded, c.employees, c.services, c.badges, c.about,
          c.phone, c.site, c.email, c.atendeUfs, usuarioId,
        ]
      );
      await client.query('UPDATE usuarios SET company_id = $1 WHERE id = $2', [c.id, usuarioId]);
      await client.query('COMMIT');
      return rowToCompany(rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async existsId(id: string): Promise<boolean> {
    const { rows } = await query('SELECT 1 FROM companies WHERE id = $1', [id]);
    return rows.length > 0;
  },

  // Qualquer salvamento de perfil bem-sucedido conta como cadastro finalizado
  // — é o gatilho que promove a empresa de 'pre_cadastro' pra 'completo'.
  async updateProfile(
    id: string,
    p: {
      name: string;
      tagline: string;
      about: string;
      site: string;
      employees: string;
      email: string;
      phone: string;
      city: string;
      uf: string;
      atendeUfs: string[];
      badges: string[];
      plano?: PlanoEmpresa;
    }
  ): Promise<Company | null> {
    const { rows } = await query(
      `UPDATE companies SET
         name=$2, tagline=$3, about=$4, site=$5, employees=$6,
         email=$7, phone=$8, city=$9, uf=$10, atende_ufs=$11, badges=$12, status='completo',
         plano=COALESCE($13, plano)
       WHERE id=$1 RETURNING *`,
      [
        id, p.name, p.tagline, p.about, p.site, p.employees, p.email, p.phone,
        p.city, p.uf, p.atendeUfs, p.badges, p.plano ?? null,
      ]
    );
    return rows[0] ? rowToCompany(rows[0]) : null;
  },

  // Painel de admin: todas as empresas (independente de status), com o dono.
  async adminList(): Promise<AdminCompany[]> {
    const { rows } = await query(
      `SELECT c.*, u.nome AS dono_nome, u.email AS dono_email
         FROM companies c
         LEFT JOIN usuarios u ON u.id = c.usuario_id
        ORDER BY c.created_at DESC`
    );
    return rows.map(rowToAdminCompany);
  },

  // Admin edita selo e plano manualmente (não há cobrança automática ainda).
  async updateAdmin(id: string, p: { verified?: boolean; plano?: PlanoEmpresa }): Promise<Company | null> {
    const { rows } = await query(
      `UPDATE companies SET
         verified = COALESCE($2, verified),
         plano = COALESCE($3, plano)
       WHERE id = $1 RETURNING *`,
      [id, p.verified ?? null, p.plano ?? null]
    );
    return rows[0] ? rowToCompany(rows[0]) : null;
  },

  // Remove a empresa e tudo que só existe em função dela: solicitações
  // recebidas por ela e o vínculo da conta que a administrava.
  async remove(id: string): Promise<boolean> {
    const client = await getClient();
    try {
      await client.query('BEGIN');
      const { rowCount } = await client.query('DELETE FROM companies WHERE id = $1', [id]);
      if (rowCount) {
        await client.query('DELETE FROM solicitacoes WHERE prestador_id = $1', [id]);
        await client.query('UPDATE usuarios SET company_id = NULL WHERE company_id = $1', [id]);
      }
      await client.query('COMMIT');
      return !!rowCount;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};
