// Access token do usuário logado. Fica fora do estado do React de propósito:
// o interceptor do axios precisa dele de forma síncrona, antes de qualquer render.
const CHAVE = 'token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(CHAVE);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHAVE, token);
  } catch {
    /* modo privado / storage bloqueado — a sessão vive só nesta aba */
  }
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* nada a limpar */
  }
}
