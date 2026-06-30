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
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
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
      src="/logo-360h.png"
      alt="360 Hospitalar — Plataforma de Prestadores de Serviços"
      width={200}
      height={260}
      style={{ height, width: 'auto' }}
      className={className}
      priority
      onError={() => setImgError(true)}
    />
  );
}
