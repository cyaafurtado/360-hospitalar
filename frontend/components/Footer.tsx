'use client';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="muted">© 2026 360 Hospitalar · Diretório B2B do setor de saúde</div>
        <div className="footer-links">
          <a>Sobre</a>
          <Link href="/como-verificamos">Como verificamos</Link>
          <Link href="/cadastrar">Para fornecedores</Link>
          <a>Contato</a>
        </div>
      </div>
    </footer>
  );
}
