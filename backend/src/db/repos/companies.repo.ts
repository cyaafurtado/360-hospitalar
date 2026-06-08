import { query } from '../connection';
import { Company } from '../../models/types';

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
  };
}

export const CompaniesRepo = {
  async list(): Promise<Company[]> {
    const { rows } = await query('SELECT * FROM companies ORDER BY rating DESC');
    return rows.map(rowToCompany);
  },

  async getById(id: string): Promise<Company | null> {
    const { rows } = await query('SELECT * FROM companies WHERE id = $1', [id]);
    return rows[0] ? rowToCompany(rows[0]) : null;
  },

  async create(c: {
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
  }): Promise<Company> {
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

  async existsId(id: string): Promise<boolean> {
    const { rows } = await query('SELECT 1 FROM companies WHERE id = $1', [id]);
    return rows.length > 0;
  },

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
    }
  ): Promise<Company | null> {
    const { rows } = await query(
      `UPDATE companies SET
         name=$2, tagline=$3, about=$4, site=$5, employees=$6,
         email=$7, phone=$8, city=$9, uf=$10, atende_ufs=$11
       WHERE id=$1 RETURNING *`,
      [id, p.name, p.tagline, p.about, p.site, p.employees, p.email, p.phone, p.city, p.uf, p.atendeUfs]
    );
    return rows[0] ? rowToCompany(rows[0]) : null;
  },
};
