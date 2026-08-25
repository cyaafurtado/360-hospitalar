'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '../lib/icons';
import { useAppStore } from '../lib/store';

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAppStore((s) => s.logout);

  const exit = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="portal-subnav">
      <div className="portal-subnav-inner">
        <div className="portal-tabs">
          <Link href="/admin" className={'portal-tab' + (pathname === '/admin' ? ' on' : '')}>
            <Icon name="clipboard" size={16} /> Fornecedores
          </Link>
          <Link href="/admin/usuarios" className={'portal-tab' + (pathname === '/admin/usuarios' ? ' on' : '')}>
            <Icon name="users" size={16} /> Usuários
          </Link>
          <Link href="/admin/contratos" className={'portal-tab' + (pathname === '/admin/contratos' ? ' on' : '')}>
            <Icon name="file" size={16} /> Contratos
          </Link>
        </div>
        <div className="portal-subnav-actions">
          <span className="portal-role-badge">
            <Icon name="shield2" size={13} stroke={2} /> Administrador
          </span>
          <button className="portal-exit" onClick={exit}>
            <Icon name="back" size={15} /> Sair
          </button>
        </div>
      </div>
    </div>
  );
}
