'use client';
import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '../../lib/icons';
import { OrbitMark } from '../../components/OrbitMark';
import { useAppStore } from '../../lib/store';

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const login = useAppStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const valid = /\S+@\S+\.\S+/.test(email) && pass.length >= 4;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setError('Informe um e-mail válido e a senha (mín. 4 caracteres).');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login(email);
      router.push(from || '/escolher-perfil');
    }, 700);
  };

  return (
    <div className="login-screen">
      <aside className="login-brand">
        <button className="login-back" onClick={() => router.push('/')}>
          <Icon name="back" size={16} /> Voltar ao site
        </button>
        <div className="login-brand-inner">
          <OrbitMark size={52} ring="#fff" plus="oklch(0.68 0.15 165)" node="#fff" />
          <h2>
            Portal do parceiro
            <br />
            360 Hospitalar
          </h2>
          <p>
            Acesse para gerenciar o perfil da sua empresa, responder pedidos de orçamento e acompanhar suas
            avaliações.
          </p>
          <ul className="login-perks">
            <li><Icon name="check" size={15} stroke={2.6} /> Painel de leads e contatos</li>
            <li><Icon name="check" size={15} stroke={2.6} /> Gestão do selo verificado</li>
            <li><Icon name="check" size={15} stroke={2.6} /> Métricas de visibilidade na busca</li>
          </ul>
        </div>
        <div className="login-brand-foot">Rede de prestadores · serviços hospitalares</div>
      </aside>

      <main className="login-main">
        <div className="login-card">
          <div className="login-head">
            <h1>Entrar no portal</h1>
            <p>Use suas credenciais de acesso.</p>
          </div>

          <form className="login-form" onSubmit={submit}>
            <label className="reg-field">
              <span className="reg-label">E-mail ou login</span>
              <div className="login-input">
                <Icon name="users" size={17} />
                <input
                  type="email"
                  value={email}
                  autoComplete="username"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="voce@empresa.com.br"
                />
              </div>
            </label>

            <label className="reg-field">
              <span className="reg-label">Senha</span>
              <div className="login-input">
                <Icon name="shield2" size={17} />
                <input
                  type={show ? 'text' : 'password'}
                  value={pass}
                  autoComplete="current-password"
                  onChange={(e) => {
                    setPass(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="login-eye"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {show ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </label>

            {error && (
              <div className="login-error">
                <Icon name="close" size={14} stroke={2.4} /> {error}
              </div>
            )}

            <div className="login-row">
              <label className="login-remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span className="fr-box">
                  <Icon name="check" size={12} stroke={3} />
                </span>
                Manter conectado
              </label>
              <a className="login-link" onClick={(e) => e.preventDefault()}>
                Esqueci a senha
              </a>
            </div>

            <button type="submit" className="btn-primary login-submit" disabled={loading}>
              {loading ? 'Entrando…' : <>Entrar <Icon name="arrow" size={16} /></>}
            </button>
          </form>

          <div className="login-divider">
            <span>ou</span>
          </div>

          <div className="login-foot">
            Ainda não tem cadastro?
            <a className="login-link" onClick={() => router.push('/cadastrar')}>
              {' '}
              Cadastrar empresa
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense>
      <EntrarForm />
    </Suspense>
  );
}
