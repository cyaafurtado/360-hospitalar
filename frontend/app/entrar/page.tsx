'use client';
import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icon } from '../../lib/icons';
import { BrandLogo } from '../../components/BrandLogo';
import { useAppStore } from '../../lib/store';
import { login as loginApi, registrar, reenviarConfirmacao, mensagemDeErro, codigoDoErro } from '../../lib/services';
import type { UsuarioTipo } from '../../data/types';

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const signIn = useAppStore((s) => s.signIn);
  // Quem clicou em "Cadastrar empresa" nao veio para fazer login: a empresa fica
  // vinculada a uma conta, entao a tela abre ja em "criar conta" e diz o porque.
  const vindoDoCadastro = from === '/cadastrar';
  const [modo, setModo] = useState<'entrar' | 'criar'>(vindoDoCadastro ? 'criar' : 'entrar');
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState<UsuarioTipo>('fornecedor');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // Cadastro enviado, aguardando o clique no e-mail de confirmação.
  const [pendingEmail, setPendingEmail] = useState('');
  // Login recusado por e-mail não confirmado: guarda o e-mail pra oferecer reenvio.
  const [precisaConfirmar, setPrecisaConfirmar] = useState('');
  const [reenviando, setReenviando] = useState(false);
  const [reenviado, setReenviado] = useState(false);

  const criando = modo === 'criar';
  const emailOk = /\S+@\S+\.\S+/.test(email);
  const senhasConferem = pass === passConfirm;
  const valid = criando
    ? emailOk && nome.trim().length >= 2 && pass.length >= 8 && senhasConferem
    : emailOk && pass.length >= 4;

  const trocarModo = () => {
    setModo(criando ? 'entrar' : 'criar');
    setError('');
    setPass('');
    setPassConfirm('');
    setPrecisaConfirmar('');
  };

  const reenviarEmail = async (destino: string) => {
    setReenviando(true);
    try {
      await reenviarConfirmacao(destino);
      setReenviado(true);
    } finally {
      setReenviando(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid) {
      setError(
        criando
          ? pass.length >= 8 && !senhasConferem
            ? 'As senhas digitadas não coincidem.'
            : 'Informe seu nome, um e-mail válido e uma senha de pelo menos 8 caracteres.'
          : 'Informe um e-mail válido e a senha.'
      );
      return;
    }
    setError('');
    setPrecisaConfirmar('');
    setLoading(true);
    try {
      if (criando) {
        await registrar({ nome: nome.trim(), email, senha: pass, tipo });
        setPendingEmail(email);
        setLoading(false);
        return;
      }
      const { token, usuario } = await loginApi({ email, senha: pass });
      signIn(token, usuario);
      // A conta já diz se é fornecedor ou instituição (escolhido aqui em cima,
      // ou no cadastro anterior) — perguntar de novo em /escolher-perfil seria
      // repetir a mesma pergunta. Só passa por lá quem pedir manualmente
      // ("Trocar perfil"), não no fluxo automático de login/criação de conta.
      router.push(
        usuario.tipo === 'admin' ? '/admin' : from || (usuario.tipo === 'contratante' ? '/painel' : '/portal')
      );
    } catch (err) {
      if (!criando && codigoDoErro(err) === 'EMAIL_NAO_VERIFICADO') {
        setPrecisaConfirmar(email);
        setReenviado(false);
      }
      setError(
        mensagemDeErro(
          err,
          criando ? 'Não foi possível criar a conta agora. Tente novamente.' : 'Não foi possível entrar agora. Tente novamente.'
        )
      );
      setLoading(false);
    }
  };

  if (pendingEmail) {
    return (
      <div className="login-screen">
        <aside className="login-brand">
          <button className="login-back" onClick={() => router.push('/')}>
            <Icon name="back" size={16} /> Voltar ao site
          </button>
          <div className="login-brand-inner">
            <span className="login-logo-wrap"><BrandLogo height={80} ring="#fff" plus="oklch(0.68 0.15 165)" node="#fff" /></span>
            <h2>Confirme seu e-mail</h2>
            <p>Falta só um passo para ativar sua conta.</p>
          </div>
        </aside>
        <main className="login-main">
          <div className="login-card">
            <div className="login-head">
              <h1>Verifique sua caixa de entrada</h1>
              <p>
                Enviamos um link de confirmação para <strong>{pendingEmail}</strong>. Abra o e-mail e clique no
                link para ativar sua conta e entrar.
              </p>
            </div>
            {reenviado ? (
              <div className="login-error" style={{ background: 'var(--surface-alt, #eef7f0)' }}>
                <Icon name="check" size={14} stroke={2.6} /> E-mail reenviado. Confira sua caixa de entrada.
              </div>
            ) : (
              <button className="btn-ghost" disabled={reenviando} onClick={() => reenviarEmail(pendingEmail)}>
                {reenviando ? 'Reenviando…' : 'Não recebeu? Reenviar e-mail'}
              </button>
            )}
            <div className="login-foot">
              <a className="login-link" onClick={() => { setPendingEmail(''); setModo('entrar'); }}>
                Voltar para entrar
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <aside className="login-brand">
        <button className="login-back" onClick={() => router.push('/')}>
          <Icon name="back" size={16} /> Voltar ao site
        </button>
        <div className="login-brand-inner">
          <span className="login-logo-wrap"><BrandLogo height={80} ring="#fff" plus="oklch(0.68 0.15 165)" node="#fff" /></span>
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
            <h1>{criando ? 'Criar conta' : 'Entrar no portal'}</h1>
            <p>
              {vindoDoCadastro && criando
                ? 'Sua empresa fica vinculada a esta conta. Leva menos de um minuto.'
                : criando
                  ? 'Leva menos de um minuto.'
                  : 'Use suas credenciais de acesso.'}
            </p>
          </div>

          <form className="login-form" onSubmit={submit}>
            {criando && (
              <>
                <label className="reg-field">
                  <span className="reg-label">Seu nome</span>
                  <div className="login-input">
                    <Icon name="users" size={17} />
                    <input
                      type="text"
                      value={nome}
                      autoComplete="name"
                      onChange={(e) => {
                        setNome(e.target.value);
                        setError('');
                      }}
                      placeholder="Como devemos te chamar"
                    />
                  </div>
                </label>

                <div className="reg-field">
                  <span className="reg-label">Você é</span>
                  <div className="role-toggle">
                    <button
                      type="button"
                      className={tipo === 'fornecedor' ? 'role-toggle-on' : ''}
                      onClick={() => setTipo('fornecedor')}
                    >
                      Fornecedor
                    </button>
                    <button
                      type="button"
                      className={tipo === 'contratante' ? 'role-toggle-on' : ''}
                      onClick={() => setTipo('contratante')}
                    >
                      Unidade de saúde
                    </button>
                  </div>
                </div>
              </>
            )}

            <label className="reg-field">
              <span className="reg-label">{criando ? 'E-mail' : 'E-mail ou login'}</span>
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
              <span className="reg-label">{criando ? 'Senha (mín. 8 caracteres)' : 'Senha'}</span>
              <div className="login-input">
                <Icon name="shield2" size={17} />
                <input
                  type={show ? 'text' : 'password'}
                  value={pass}
                  autoComplete={criando ? 'new-password' : 'current-password'}
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

            {criando && (
              <label className="reg-field">
                <span className="reg-label">Confirmar senha</span>
                <div className="login-input">
                  <Icon name="shield2" size={17} />
                  <input
                    type={show ? 'text' : 'password'}
                    value={passConfirm}
                    autoComplete="new-password"
                    onPaste={(e) => e.preventDefault()}
                    onChange={(e) => {
                      setPassConfirm(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                  />
                </div>
                {passConfirm.length > 0 && !senhasConferem && (
                  <span className="reg-hint">As senhas não coincidem.</span>
                )}
              </label>
            )}

            {error && (
              <div className="login-error">
                <Icon name="close" size={14} stroke={2.4} /> {error}
              </div>
            )}

            {precisaConfirmar && (
              reenviado ? (
                <div className="login-error" style={{ background: 'var(--surface-alt, #eef7f0)' }}>
                  <Icon name="check" size={14} stroke={2.6} /> E-mail reenviado. Confira sua caixa de entrada.
                </div>
              ) : (
                <button type="button" className="btn-ghost" disabled={reenviando} onClick={() => reenviarEmail(precisaConfirmar)}>
                  {reenviando ? 'Reenviando…' : 'Reenviar e-mail de confirmação'}
                </button>
              )
            )}

            <div className="login-row" style={{ display: criando ? 'none' : undefined }}>
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
              {loading ? (
                criando ? 'Criando conta…' : 'Entrando…'
              ) : (
                <>
                  {criando ? 'Criar conta' : 'Entrar'} <Icon name="arrow" size={16} />
                </>
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>ou</span>
          </div>

          <div className="login-foot">
            {criando ? 'Já tem conta?' : 'Ainda não tem conta?'}
            <a className="login-link" onClick={trocarModo}>
              {' '}
              {criando ? 'Entrar' : 'Criar conta'}
            </a>
            {!criando && (
              <>
                {' · '}
                <a className="login-link" onClick={() => router.push('/cadastrar')}>
                  Cadastrar empresa
                </a>
              </>
            )}
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
