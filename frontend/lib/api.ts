import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { clearToken, getToken, setToken } from './token';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// withCredentials: o refresh token viaja em cookie httpOnly, invisível para o JS.
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type ComRetry = InternalAxiosRequestConfig & { _retry?: boolean };

// Uma renovação por vez: várias chamadas que tomam 401 juntas esperam a mesma promise.
let renovacao: Promise<string | null> | null = null;

async function renovarSessao(): Promise<string | null> {
  try {
    const { data } = await axios.post<{ token: string }>(
      `${API_URL}/api/auth/refresh`,
      {},
      { withCredentials: true }
    );
    setToken(data.token);
    return data.token;
  } catch {
    clearToken();
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (err: AxiosError) => {
    const original = err.config as ComRetry | undefined;
    const ehRotaDeAuth = original?.url?.includes('/auth/') ?? false;

    // 401 numa rota comum: o access token expirou. Renova pelo cookie e repete a chamada.
    if (err.response?.status === 401 && original && !original._retry && !ehRotaDeAuth && getToken()) {
      original._retry = true;
      renovacao = renovacao ?? renovarSessao();
      const novo = await renovacao;
      renovacao = null;

      if (novo) {
        original.headers.Authorization = `Bearer ${novo}`;
        return api(original);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
