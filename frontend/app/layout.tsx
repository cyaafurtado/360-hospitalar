import type { Metadata } from 'next';
import '../styles/globals.css';
import { AppShell } from '../components/AppShell';

export const metadata: Metadata = {
  title: '360 Hospitalar — Diretório B2B do setor de saúde',
  description:
    'Clínicas e hospitais encontram fornecedores e parceiros verificados do setor de saúde.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
