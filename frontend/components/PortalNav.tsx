'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from '../lib/icons';
import { useAppStore } from '../lib/store';

export function PortalNav() {
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
          <Link href="/portal" className={'portal-tab' + (pathname === '/portal' ? ' on' : '')}>
            <Icon name="list" size={16} /> Solicitações
          </Link>
          <Link
            href="/portal/perfil"
            className={'portal-tab' + (pathname === '/portal/perfil' ? ' on' : '')}
          >
            <Icon name="shield2" size={16} /> Meu perfil
          </Link>
        </div>
        <button className="portal-exit" onClick={exit}>
          <Icon name="back" size={15} /> Sair do portal
        </button>
      </div>
    </div>
  );
}
