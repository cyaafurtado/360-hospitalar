'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '../lib/icons';
import { useAppStore } from '../lib/store';

export function PainelNav() {
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
          <Link href="/painel" className={'portal-tab' + (pathname === '/painel' ? ' on' : '')}>
            <Icon name="list" size={16} /> Minhas solicitações
          </Link>
          <Link href="/buscar" className="portal-tab">
            <Icon name="search" size={16} /> Buscar fornecedores
          </Link>
        </div>
        <div className="portal-subnav-actions">
          <span className="portal-role-badge tone-green">
            <Icon name="pulse" size={13} stroke={2} /> Unidade de Saúde
          </span>
          <button className="portal-switch" onClick={() => router.push('/escolher-perfil')}>
            <Icon name="sliders" size={14} /> Trocar perfil
          </button>
          <button className="portal-exit" onClick={exit}>
            <Icon name="back" size={15} /> Sair
          </button>
        </div>
      </div>
    </div>
  );
}
