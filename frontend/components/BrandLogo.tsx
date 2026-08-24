'use client';
import { useState } from 'react';
import Image from 'next/image';
import { OrbitMark } from './OrbitMark';

export function BrandLogo({
  height = 48,
  className,
  ring,
  plus,
  node,
}: {
  height?: number;
  className?: string;
  ring?: string;
  plus?: string;
  node?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <span className="brand-fallback">
        <OrbitMark size={height} ring={ring} plus={plus} node={node} />
        <span className="brand-lockup">
          <span className="brand-name">360 <span>Hospitalar</span></span>
          <span className="brand-tagline">REDE DE PRESTADORES</span>
        </span>
      </span>
    );
  }

  return (
    <Image
      src="/logo-360h.jpg"
      alt="360 Hospitalar — Plataforma de Prestadores de Serviços"
      width={1408}
      height={768}
      // A altura vira variavel CSS para o header poder encolher a marca no
      // celular: estilo inline ganha da folha de estilo, entao sem isto nao ha
      // como reduzir por media query.
      style={{ height: `var(--brand-logo-h, ${height}px)`, width: 'auto', maxWidth: '100%' }}
      className={className}
      priority
      onError={() => setImgError(true)}
    />
  );
}
