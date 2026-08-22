'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../../lib/store';
import { Icon } from '../../../lib/icons';
import { PortalNav } from '../../../components/PortalNav';

export default function DashboardPage() {
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !authEmail) router.replace('/entrar');
  }, [hydrated, authEmail, router]);

  return (
    <div className="portal-screen">
      <PortalNav />
      <div className="portal-body">
        <div className="empty">
          <Icon name="signal" size={32} />
          <h3>Dashboard em desenvolvimento</h3>
          <p>Os gráficos de desempenho estarão disponíveis em breve.</p>
        </div>
      </div>
    </div>
  );
}
