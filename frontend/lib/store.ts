import { create } from 'zustand';

export type ThemeName = 'trust' | 'clinic' | 'editorial';
export type Density = 'compact' | 'regular' | 'comfy';
export type Sort = 'rating' | 'reviews' | 'az';
export type Layout = 'grid' | 'list';

export type Filters = { segments: string[]; uf: string; minRating: number; onlyVerified: boolean };
export const EMPTY_FILTERS: Filters = { segments: [], uf: '', minRating: 0, onlyVerified: false };

export const DEFAULT_ACCENT = 'oklch(0.56 0.16 248)';

type AppState = {
  // tema
  theme: ThemeName;
  density: Density;
  accent: string;
  setTheme: (t: ThemeName) => void;
  setDensity: (d: Density) => void;
  setAccent: (a: string) => void;

  // auth (mock por enquanto)
  authEmail: string | null;
  login: (email: string) => void;
  logout: () => void;

  // busca (compartilhada Home ↔ Resultados)
  query: string;
  uf: string;
  filters: Filters;
  sort: Sort;
  layout: Layout;
  setQuery: (v: string) => void;
  setUf: (v: string) => void;
  setFilters: (f: Filters) => void;
  setSort: (s: Sort) => void;
  setLayout: (l: Layout) => void;
  pickSegment: (segId: string) => void;
  applySearchUf: () => void;
};

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'trust',
  density: 'regular',
  accent: DEFAULT_ACCENT,
  setTheme: (theme) => set({ theme }),
  setDensity: (density) => set({ density }),
  setAccent: (accent) => set({ accent }),

  authEmail: null,
  login: (authEmail) => set({ authEmail }),
  logout: () => set({ authEmail: null }),

  query: '',
  uf: 'PA',
  filters: { ...EMPTY_FILTERS },
  sort: 'rating',
  layout: 'grid',
  setQuery: (query) => set({ query }),
  setUf: (uf) => set({ uf }),
  setFilters: (filters) => set({ filters }),
  setSort: (sort) => set({ sort }),
  setLayout: (layout) => set({ layout }),
  pickSegment: (segId) => set({ filters: { segments: [segId], uf: get().uf || '', minRating: 0, onlyVerified: false } }),
  applySearchUf: () => set((s) => ({ filters: { ...s.filters, uf: s.uf || s.filters.uf } })),
}));
