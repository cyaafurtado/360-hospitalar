'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from './BrandLogo';
import { useAppStore } from '../lib/store';

export function Header() {
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);

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
            <button className="btn-primary" onClick={() => router.push('/portal')}>
              Meu portal
            </button>
          ) : (
            <>
              <a className="header-login" onClick={() => router.push('/entrar')}>
                Entrar
              </a>
              <button className="btn-primary" onClick={() => router.push('/cadastrar')}>
                Cadastrar empresa
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
