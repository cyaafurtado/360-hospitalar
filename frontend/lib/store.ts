import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Usuario } from '../data/types';
import { clearToken, setToken } from './token';
import { logoutApi } from './services';

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

  // sessão
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  usuario: Usuario | null;
  authEmail: string | null;
  profileRole: 'fornecedor' | 'contratante' | null;
  signIn: (token: string, usuario: Usuario) => void;
  setProfileRole: (role: 'fornecedor' | 'contratante') => void;
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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'trust',
      density: 'regular',
      accent: DEFAULT_ACCENT,
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      setAccent: (accent) => set({ accent }),

      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
      usuario: null,
      authEmail: null,
      profileRole: null,

      signIn: (token, usuario) => {
        setToken(token);
        // Quem se cadastrou como instituição já entra no perfil dela; fornecedor idem.
        // Admin não tem "perfil" de fornecedor/contratante — não usa essa noção.
        set({
          usuario,
          authEmail: usuario.email,
          profileRole: usuario.tipo === 'admin' ? null : usuario.tipo,
        });
      },

      setProfileRole: (profileRole) => set({ profileRole }),

      logout: () => {
        // Revoga o refresh token no servidor; a saída local não espera a rede.
        void logoutApi();
        clearToken();
        set({ usuario: null, authEmail: null, profileRole: null });
      },

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
      pickSegment: (segId) =>
        set({ filters: { segments: [segId], uf: get().uf || '', minRating: 0, onlyVerified: false } }),
      applySearchUf: () => set((s) => ({ filters: { ...s.filters, uf: s.uf || s.filters.uf } })),
    }),
    {
      name: '360h-sessao',
      storage: createJSONStorage(() => localStorage),
      // Rehidratamos à mão no AppShell: assim o primeiro render do cliente é igual
      // ao HTML do servidor e o React não acusa divergência de hidratação.
      skipHydration: true,
      partialize: (s) => ({
        usuario: s.usuario,
        authEmail: s.authEmail,
        profileRole: s.profileRole,
      }),
    }
  )
);
