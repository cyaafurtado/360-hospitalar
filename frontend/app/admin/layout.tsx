'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { AdminNav } from '../../components/AdminNav';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const hydrated = useAppStore((s) => s.hydrated);
  const usuario = useAppStore((s) => s.usuario);

  useEffect(() => {
    if (!hydrated) return;
    if (!usuario) router.replace('/entrar?from=/admin');
    else if (usuario.tipo !== 'admin') router.replace('/');
  }, [hydrated, usuario, router]);

  if (!hydrated || !usuario || usuario.tipo !== 'admin') return null;

  return (
    <div className="portal-screen">
      <AdminNav />
      <div className="portal-body">{children}</div>
    </div>
  );
}
