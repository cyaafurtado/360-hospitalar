'use client';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';
import { Icon } from '../lib/icons';

const NAV_LINKS = [
  { label: 'Sobre', href: null },
  { label: 'Como verificamos', href: '/como-verificamos' },
  { label: 'Para fornecedores', href: '/cadastrar' },
  { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
];

const CONTACT = [
  { icon: 'mail', text: 'contato@360hospitalar.com.br' },
  { icon: 'phone', text: '(11) 3000-0000' },
  { icon: 'clock', text: 'Seg–Sex, 9h às 18h' },
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">

        <div className="footer-brand">
          <div className="footer-brand-logo">
            <BrandLogo height={64} />
          </div>
          <p className="footer-brand-desc">
            Diretório B2B do setor de saúde. Conectamos compradores e
            fornecedores verificados em todo o Brasil.
          </p>
        </div>

        <div className="footer-col">
          <span className="footer-col-title">Plataforma</span>
          {NAV_LINKS.map((l) =>
            l.href ? (
              <Link key={l.label} href={l.href} className="footer-link">{l.label}</Link>
            ) : (
              <span key={l.label} className="footer-link muted-link">{l.label}</span>
            )
          )}
        </div>

        <div className="footer-col">
          <span className="footer-col-title">Entre em contato</span>
          {CONTACT.map((c) => (
            <div key={c.icon} className="footer-contact-item">
              <Icon name={c.icon} size={14} stroke={1.8} />
              <span>{c.text}</span>
            </div>
          ))}
        </div>

      </div>

      <div className="footer-bottom">
        <span className="muted">© 2026 360 Hospitalar · Todos os direitos reservados</span>
      </div>
    </footer>
  );
}
