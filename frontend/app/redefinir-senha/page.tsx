'use client';
import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '../../lib/icons';
import { BrandLogo } from '../../components/BrandLogo';
import { redefinirSenha, mensagemDeErro } from '../../lib/services';

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [show, setShow] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  const senhasConferem = senha === confirmar;
  const valid = !!token && senha.length >= 8 && senhasConferem;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Link de recuperação inválido. Peça um novo link.');
      return;
    }
    if (!valid) {
      setError(
        senha.length >= 8 && !senhasConferem
          ? 'As senhas digitadas não coincidem.'
          : 'A senha precisa ter pelo menos 8 caracteres.'
      );
      return;
    }
    setError('');
    setEnviando(true);
    try {
      await redefinirSenha(token, senha);
      setOk(true);
    } catch (err) {
      setError(mensagemDeErro(err, 'Não foi possível redefinir sua senha agora.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-screen">
      <aside className="login-brand">
        <div className="login-brand-inner">
          <span className="login-logo-wrap"><BrandLogo height={80} ring="#fff" plus="oklch(0.68 0.15 165)" node="#fff" /></span>
          <h2>Redefinir senha</h2>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-card">
          {ok ? (
            <>
              <div className="login-head">
                <h1><Icon name="check" size={22} stroke={2.6} /> Senha redefinida!</h1>
                <p>Sua senha foi alterada. Entre na sua conta com a senha nova.</p>
              </div>
              <button className="btn-primary login-submit" onClick={() => router.push('/entrar')}>
                Ir para o login <Icon name="arrow" size={16} />
              </button>
            </>
          ) : !token ? (
            <>
              <div className="login-head">
                <h1>Link inválido</h1>
                <p>Este link de recuperação de senha não é válido. Peça um novo para continuar.</p>
              </div>
              <button className="btn-primary login-submit" onClick={() => router.push('/recuperar-senha')}>
                Pedir novo link
              </button>
            </>
          ) : (
            <>
              <div className="login-head">
                <h1>Escolha uma senha nova</h1>
                <p>Vale para todos os acessos futuros à sua conta.</p>
              </div>

              <form className="login-form" onSubmit={submit}>
                <label className="reg-field">
                  <span className="reg-label">Senha nova (mín. 8 caracteres)</span>
                  <div className="login-input">
                    <Icon name="shield2" size={17} />
                    <input
                      type={show ? 'text' : 'password'}
                      value={senha}
                      autoComplete="new-password"
                      onChange={(e) => {
                        setSenha(e.target.value);
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

                <label className="reg-field">
                  <span className="reg-label">Confirmar senha nova</span>
                  <div className="login-input">
                    <Icon name="shield2" size={17} />
                    <input
                      type={show ? 'text' : 'password'}
                      value={confirmar}
                      autoComplete="new-password"
                      onPaste={(e) => e.preventDefault()}
                      onChange={(e) => {
                        setConfirmar(e.target.value);
                        setError('');
                      }}
                      placeholder="••••••••"
                    />
                  </div>
                  {confirmar.length > 0 && !senhasConferem && (
                    <span className="reg-hint">As senhas não coincidem.</span>
                  )}
                </label>

                {error && (
                  <div className="login-error">
                    <Icon name="close" size={14} stroke={2.4} /> {error}
                  </div>
                )}

                <button type="submit" className="btn-primary login-submit" disabled={enviando}>
                  {enviando ? 'Salvando…' : 'Salvar senha nova'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense>
      <RedefinirSenhaForm />
    </Suspense>
  );
}
