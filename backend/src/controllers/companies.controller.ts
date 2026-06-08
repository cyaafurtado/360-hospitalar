import { Request, Response } from 'express';
import { CompaniesRepo } from '../db/repos/companies.repo';

const LOGGED_SUPPLIER_ID = 'medlab';

function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

export class CompaniesController {
  static async list(_req: Request, res: Response): Promise<void> {
    res.json(await CompaniesRepo.list());
  }

  static async getById(req: Request, res: Response): Promise<void> {
    const c = await CompaniesRepo.getById(req.params.id);
    if (!c) {
      res.status(404).json({ error: 'Empresa não encontrada' });
      return;
    }
    res.json(c);
  }

  static async create(req: Request, res: Response): Promise<void> {
    const b = req.body ?? {};
    if (!b.name || !b.segment) {
      res.status(400).json({ error: 'Campos obrigatórios: name, segment' });
      return;
    }
    let id = slugify(b.name) || 'empresa';
    if (await CompaniesRepo.existsId(id)) {
      id = `${id}-${Math.random().toString(36).slice(2, 7)}`;
    }
    const company = await CompaniesRepo.create({
      id,
      name: b.name,
      segment: b.segment,
      tagline: b.tagline ?? '',
      city: b.city ?? '',
      uf: b.uf ?? '',
      founded: Number(b.founded) || new Date().getFullYear(),
      employees: b.employees || '1–10',
      services: Array.isArray(b.services) ? b.services : [],
      badges: Array.isArray(b.badges) ? b.badges : [],
      about: b.about ?? '',
      phone: b.phone ?? '',
      site: b.site ?? '',
      email: b.email ?? null,
      atendeUfs: Array.isArray(b.atendeUfs) ? b.atendeUfs : [],
    });
    res.status(201).json(company);
  }

  // Perfil do fornecedor logado (mock = medlab)
  static async getProfile(_req: Request, res: Response): Promise<void> {
    const c = await CompaniesRepo.getById(LOGGED_SUPPLIER_ID);
    if (!c) {
      res.status(404).json({ error: 'Perfil não encontrado' });
      return;
    }
    res.json({
      name: c.name,
      tagline: c.tagline,
      about: c.about,
      segment: c.segment,
      uf: c.uf,
      city: c.city,
      email: c.email ?? `contato@${c.site}`,
      phone: c.phone,
      site: c.site,
      employees: c.employees,
      atendeUfs: c.atendeUfs,
      rating: c.rating,
      reviews: c.reviews,
      verified: c.verified,
    });
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    const b = req.body ?? {};
    const c = await CompaniesRepo.updateProfile(LOGGED_SUPPLIER_ID, {
      name: b.name ?? '',
      tagline: b.tagline ?? '',
      about: b.about ?? '',
      site: b.site ?? '',
      employees: b.employees ?? '',
      email: b.email ?? '',
      phone: b.phone ?? '',
      city: b.city ?? '',
      uf: b.uf ?? '',
      atendeUfs: Array.isArray(b.atendeUfs) ? b.atendeUfs : [],
    });
    if (!c) {
      res.status(404).json({ error: 'Perfil não encontrado' });
      return;
    }
    res.json({
      name: c.name, tagline: c.tagline, about: c.about, segment: c.segment,
      uf: c.uf, city: c.city, email: c.email ?? `contato@${c.site}`, phone: c.phone,
      site: c.site, employees: c.employees, atendeUfs: c.atendeUfs,
      rating: c.rating, reviews: c.reviews, verified: c.verified,
    });
  }
}
