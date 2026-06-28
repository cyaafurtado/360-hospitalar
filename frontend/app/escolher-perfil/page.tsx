'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { OrbitMark } from '../../components/OrbitMark';
import { Icon } from '../../lib/icons';

export default function EscolherPerfilPage() {
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);
  const setProfileRole = useAppStore((s) => s.setProfileRole);
  const logout = useAppStore((s) => s.logout);

  useEffect(() => {
    if (!authEmail) router.replace('/entrar');
  }, [authEmail, router]);

  const choose = (role: 'fornecedor' | 'contratante') => {
    setProfileRole(role);
    router.push(role === 'fornecedor' ? '/portal' : '/painel');
  };

  const sair = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="role-pick-screen">
      <div className="role-pick-wrap">
        <div className="role-pick-head">
          <OrbitMark size={48} />
          <div>
            <h1>Como você quer entrar?</h1>
            <p>Escolha o perfil de acesso para esta sessão.</p>
          </div>
          {authEmail && (
            <div className="role-pick-email">
              <Icon name="users" size={14} /> {authEmail}
            </div>
          )}
        </div>

        <div className="role-cards">
          <button className="role-card" onClick={() => choose('fornecedor')}>
            <div className="stat-ico tone-blue">
              <Icon name="clipboard" size={26} stroke={1.5} />
            </div>
            <div className="role-card-body">
              <div className="role-card-title">Fornecedor</div>
              <div className="role-card-desc">
                Gerencie sua empresa, responda solicitações de cotação e acompanhe sua visibilidade no diretório.
              </div>
            </div>
            <Icon name="arrow" size={18} className="role-card-arrow" />
          </button>

          <button className="role-card" onClick={() => choose('contratante')}>
            <div className="stat-ico tone-green">
              <Icon name="pulse" size={26} stroke={1.5} />
            </div>
            <div className="role-card-body">
              <div className="role-card-title">Unidade de Saúde</div>
              <div className="role-card-desc">
                Busque fornecedores verificados, envie pedidos de orçamento e gerencie contratações como hospital ou clínica.
              </div>
            </div>
            <Icon name="arrow" size={18} className="role-card-arrow" />
          </button>
        </div>

        <button className="role-pick-exit" onClick={sair}>
          <Icon name="back" size={14} /> Sair da conta
        </button>
      </div>
    </div>
  );
}
