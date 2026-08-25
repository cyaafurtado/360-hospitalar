import { Request, Response } from 'express';
import { CompaniesRepo } from '../db/repos/companies.repo';
import { Company } from '../models/types';

const SEM_EMPRESA = {
  error: 'Sua conta ainda não tem empresa cadastrada.',
  code: 'SEM_EMPRESA',
};

// Resolve a empresa da conta pelo banco. O companyId do token é informativo:
// ele congela no login e fica velho assim que a pessoa cadastra a empresa.
async function empresaDoUsuario(req: Request): Promise<Company | null> {
  if (!req.user) return null;
  return CompaniesRepo.getByUsuario(req.user.sub);
}

function paraPerfil(c: Company) {
  return {
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
    badges: c.badges,
    rating: c.rating,
    reviews: c.reviews,
    verified: c.verified,
    status: c.status,
  };
}

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
    if (!req.user) {
      res.status(401).json({ error: 'Entre na sua conta para cadastrar a empresa.' });
      return;
    }
    const b = req.body ?? {};
    if (!b.name || !b.segment) {
      res.status(400).json({ error: 'Campos obrigatórios: name, segment' });
      return;
    }
    if (await CompaniesRepo.getByUsuario(req.user.sub)) {
      res.status(409).json({ error: 'Esta conta já administra uma empresa.' });
      return;
    }
    let id = slugify(b.name) || 'empresa';
    if (await CompaniesRepo.existsId(id)) {
      id = `${id}-${Math.random().toString(36).slice(2, 7)}`;
    }
    const company = await CompaniesRepo.createParaUsuario({
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
    }, req.user.sub);
    res.status(201).json(company);
  }

  // Perfil da empresa desta conta.
  static async getProfile(req: Request, res: Response): Promise<void> {
    const empresa = await empresaDoUsuario(req);
    if (!empresa) {
      res.status(404).json(SEM_EMPRESA);
      return;
    }
    res.json(paraPerfil(empresa));
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    const empresa = await empresaDoUsuario(req);
    if (!empresa) {
      res.status(404).json(SEM_EMPRESA);
      return;
    }
    const b = req.body ?? {};
    const c = await CompaniesRepo.updateProfile(empresa.id, {
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
      badges: Array.isArray(b.badges) ? b.badges : [],
    });
    if (!c) {
      res.status(404).json(SEM_EMPRESA);
      return;
    }
    res.json(paraPerfil(c));
  }
}
