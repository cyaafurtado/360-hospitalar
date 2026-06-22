'use client';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAppStore } from '../lib/store';
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
