'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '../../lib/icons';
import { BrandLogo } from '../../components/BrandLogo';
import { useAppStore } from '../../lib/store';
import { confirmarEmail, reenviarConfirmacao, mensagemDeErro } from '../../lib/services';

type Estado = 'confirmando' | 'ok' | 'erro';

function ConfirmarEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const signIn = useAppStore((s) => s.signIn);

  const [estado, setEstado] = useState<Estado>('confirmando');
  const [erro, setErro] = useState('');
  const [emailReenvio, setEmailReenvio] = useState('');
  const [reenviando, setReenviando] = useState(false);
  const [reenviado, setReenviado] = useState(false);

  useEffect(() => {
    if (!token) {
      setEstado('erro');
      setErro('Link de confirmação inválido.');
      return;
    }
    (async () => {
      try {
        const { token: accessToken, usuario } = await confirmarEmail(token);
        signIn(accessToken, usuario);
        setEstado('ok');
        setTimeout(() => {
          router.replace(usuario.tipo === 'admin' ? '/admin' : usuario.tipo === 'contratante' ? '/painel' : '/portal');
        }, 1200);
      } catch (err) {
        setEstado('erro');
        setErro(mensagemDeErro(err, 'Não foi possível confirmar seu e-mail.'));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const reenviar = async () => {
    if (!emailReenvio.trim()) return;
    setReenviando(true);
    try {
      await reenviarConfirmacao(emailReenvio.trim());
      setReenviado(true);
    } finally {
      setReenviando(false);
    }
  };

  return (
    <div className="login-screen">
      <aside className="login-brand">
        <div className="login-brand-inner">
          <span className="login-logo-wrap"><BrandLogo height={80} ring="#fff" plus="oklch(0.68 0.15 165)" node="#fff" /></span>
          <h2>Confirmação de e-mail</h2>
        </div>
      </aside>
      <main className="login-main">
        <div className="login-card">
          {estado === 'confirmando' && (
            <div className="login-head">
              <h1>Confirmando seu e-mail…</h1>
              <p>Um instante.</p>
            </div>
          )}

          {estado === 'ok' && (
            <div className="login-head">
              <h1><Icon name="check" size={22} stroke={2.6} /> E-mail confirmado!</h1>
              <p>Sua conta foi ativada. Redirecionando…</p>
            </div>
          )}

          {estado === 'erro' && (
            <>
              <div className="login-head">
                <h1>Não foi possível confirmar</h1>
                <p>{erro}</p>
              </div>

              {reenviado ? (
                <div className="login-error" style={{ background: 'var(--surface-alt, #eef7f0)' }}>
                  <Icon name="check" size={14} stroke={2.6} /> Novo e-mail enviado, se a conta existir e ainda não estiver confirmada.
                </div>
              ) : (
                <>
                  <label className="reg-field">
                    <span className="reg-label">Seu e-mail</span>
                    <div className="login-input">
                      <Icon name="users" size={17} />
                      <input
                        type="email"
                        value={emailReenvio}
                        onChange={(e) => setEmailReenvio(e.target.value)}
                        placeholder="voce@empresa.com.br"
                      />
                    </div>
                  </label>
                  <button className="btn-primary login-submit" disabled={reenviando} onClick={reenviar}>
                    {reenviando ? 'Enviando…' : 'Reenviar e-mail de confirmação'}
                  </button>
                </>
              )}

              <div className="login-foot">
                <a className="login-link" onClick={() => router.push('/entrar')}>
                  Voltar para entrar
                </a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense>
      <ConfirmarEmailForm />
    </Suspense>
  );
}
