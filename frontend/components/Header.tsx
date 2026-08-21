'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from './BrandLogo';
import { useAppStore } from '../lib/store';

export function Header() {
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);
  const profileRole = useAppStore((s) => s.profileRole);

  const irParaMeuPortal = () => {
    if (profileRole === 'contratante') router.push('/painel');
    else if (profileRole === 'fornecedor') router.push('/portal');
    else router.push('/escolher-perfil');
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/">
          <BrandLogo height={52} />
        </Link>
        <nav className="nav">
          <a onClick={() => router.push('/')}>Segmentos</a>
          <a onClick={() => router.push('/buscar')}>Pesquisar</a>
          {!authEmail && (
            <a onClick={() => router.push('/cadastrar')}>Para fornecedores</a>
          )}
          {authEmail ? (
            <button className="btn-primary" onClick={irParaMeuPortal}>
              Meu portal
            </button>
          ) : (
            <>
              <a className="header-login" onClick={() => router.push('/entrar')}>
                Entrar
              </a>
              <button className="btn-primary nav-cta" onClick={() => router.push('/cadastrar')}>
                <span className="so-desktop">Cadastrar empresa</span>
                <span className="so-mobile">Cadastrar</span>
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
