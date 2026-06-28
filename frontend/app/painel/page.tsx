'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { Icon } from '../../lib/icons';
import { PainelNav } from '../../components/PainelNav';

export default function PainelPage() {
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);

  useEffect(() => {
    if (!authEmail) router.replace('/entrar');
  }, [authEmail, router]);

  return (
    <div className="portal-screen">
      <PainelNav />
      <div className="portal-body">
        <header className="portal-head">
          <div>
            <h1>Painel da Unidade de Saúde</h1>
            <p className="muted">Gerencie suas solicitações e encontre fornecedores verificados.</p>
          </div>
          <button className="btn-primary" onClick={() => router.push('/buscar')}>
            <Icon name="search" size={16} /> Buscar fornecedores
          </button>
        </header>

        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-ico tone-blue"><Icon name="file" size={20} /></span>
            <div><div className="stat-num">0</div><div className="stat-lbl">Solicitações enviadas</div></div>
          </div>
          <div className="stat-card">
            <span className="stat-ico tone-amber"><Icon name="clock" size={20} /></span>
            <div><div className="stat-num">0</div><div className="stat-lbl">Aguardando resposta</div></div>
          </div>
          <div className="stat-card">
            <span className="stat-ico tone-green"><Icon name="check" size={20} stroke={2.4} /></span>
            <div><div className="stat-num">0</div><div className="stat-lbl">Respondidas</div></div>
          </div>
          <div className="stat-card">
            <span className="stat-ico tone-violet"><Icon name="users" size={20} /></span>
            <div><div className="stat-num">0</div><div className="stat-lbl">Fornecedores contatados</div></div>
          </div>
        </div>

        <div className="empty painel-empty">
          <Icon name="file" size={36} />
          <h3>Nenhuma solicitação ainda</h3>
          <p>Busque fornecedores e envie pedidos de orçamento para acompanhá-los aqui.</p>
          <button className="btn-primary" onClick={() => router.push('/buscar')}>
            <Icon name="search" size={16} /> Explorar fornecedores
          </button>
        </div>
      </div>
    </div>
  );
}
