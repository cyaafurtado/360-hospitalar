'use client';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '../../lib/icons';
import { BrandLogo } from '../../components/BrandLogo';
import { esqueciSenha } from '../../lib/services';

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const emailOk = /\S+@\S+\.\S+/.test(email);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!emailOk) {
      setError('Informe um e-mail válido.');
      return;
    }
    setError('');
    setEnviando(true);
    try {
      await esqueciSenha(email.trim());
      setEnviado(true);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-screen">
      <aside className="login-brand">
        <button className="login-back" onClick={() => router.push('/entrar')}>
          <Icon name="back" size={16} /> Voltar para entrar
        </button>
        <div className="login-brand-inner">
          <span className="login-logo-wrap"><BrandLogo height={80} ring="#fff" plus="oklch(0.68 0.15 165)" node="#fff" /></span>
          <h2>Recuperar senha</h2>
          <p>Informe o e-mail da sua conta e enviamos um link para você escolher uma senha nova.</p>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-card">
          {enviado ? (
            <>
              <div className="login-head">
                <h1><Icon name="check" size={22} stroke={2.6} /> Verifique sua caixa de entrada</h1>
                <p>
                  Se houver uma conta com o e-mail <strong>{email}</strong>, enviamos um link para redefinir a
                  senha. O link expira em 1 hora.
                </p>
              </div>
              <div className="login-foot">
                <a className="login-link" onClick={() => router.push('/entrar')}>
                  Voltar para entrar
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="login-head">
                <h1>Esqueceu sua senha?</h1>
                <p>Sem problema. Digite seu e-mail e mandamos um link de redefinição.</p>
              </div>

              <form className="login-form" onSubmit={submit}>
                <label className="reg-field">
                  <span className="reg-label">E-mail</span>
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

                {error && (
                  <div className="login-error">
                    <Icon name="close" size={14} stroke={2.4} /> {error}
                  </div>
                )}

                <button type="submit" className="btn-primary login-submit" disabled={enviando}>
                  {enviando ? 'Enviando…' : <>Enviar link de recuperação <Icon name="arrow" size={16} /></>}
                </button>
              </form>

              <div className="login-foot">
                Lembrou a senha?
                <a className="login-link" onClick={() => router.push('/entrar')}> Entrar</a>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
