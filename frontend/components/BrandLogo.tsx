'use client';
import Image from 'next/image';

export function BrandLogo({
  height = 48,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <Image
      src="/logo-360h.png"
      alt="360 Hospitalar — Plataforma de Prestadores de Serviços"
      width={200}
      height={260}
      style={{ height, width: 'auto' }}
      className={className}
      priority
    />
  );
}
