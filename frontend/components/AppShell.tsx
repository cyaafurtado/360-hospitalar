'use client';
import { useEffect, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../lib/store';
import { getToken } from '../lib/token';
import { getUsuarioLogado, renovarSessao } from '../lib/services';
import { Header } from './Header';
import { Footer } from './Footer';
import { TweaksPanel } from './TweaksPanel';
import { WhatsAppFloat } from './WhatsAppFloat';

// Rotas com layout próprio (sem rodapé do site)
const NO_FOOTER = ['/entrar', '/portal'];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/';
  const { theme, density, accent } = useAppStore();
  const hideFooter = NO_FOOTER.some((p) => pathname === p || pathname.startsWith(p + '/'));

  // Sessão só é lida do navegador depois da montagem — antes disso o cliente
  // renderiza igual ao servidor. Quem lê `hydrated` sabe quando o estado é confiável.
  useEffect(() => {
    let vivo = true;

    Promise.resolve(useAppStore.persist.rehydrate()).then(() => {
      if (!vivo) return;
      const { authEmail, setHydrated, signIn, logout } = useAppStore.getState();
      setHydrated(true);
      if (!authEmail) return;

      // Confere com o servidor se a sessão salva ainda vale. Sem access token,
      // tenta ressuscitar pelo cookie de refresh.
      const conferir = getToken()
        ? getUsuarioLogado().then((usuario) => useAppStore.setState({ usuario, authEmail: usuario.email }))
        : renovarSessao().then(({ token, usuario }) => signIn(token, usuario));

      conferir.catch(() => {
        if (vivo) logout();
      });
    });

    return () => {
      vivo = false;
    };
  }, []);

  return (
    <div className="app" data-theme={theme} data-density={density} style={{ ['--primary' as string]: accent }}>
      <Header />
      {children}
      {!hideFooter && <Footer />}
      <WhatsAppFloat />
      <TweaksPanel />
    </div>
  );
}
