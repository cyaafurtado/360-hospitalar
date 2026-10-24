'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { alterarSenha, mensagemDeErro } from '../lib/services';
import { useAppStore } from '../lib/store';
import { Icon } from '../lib/icons';

// Independente do "Editar perfil" da tela: troca de senha salva na hora,
// com a própria validação, igual às seções de documentos/fotos do perfil
// do fornecedor — não faz sentido ficar pendente de um "Salvar" geral.
export function SegurancaSenha() {
  const router = useRouter();
  const logout = useAppStore((s) => s.logout);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [trocada, setTrocada] = useState(false);

  const valida =
    senhaAtual.length > 0 &&
    novaSenha.length >= 8 &&
    novaSenha === confirmaSenha &&
    novaSenha !== senhaAtual;

  const submit = async () => {
    if (!valida || salvando) return;
    setErro('');
    setSalvando(true);
    try {
      await alterarSenha(senhaAtual, novaSenha);
      setTrocada(true);
      // O backend derruba todas as sessões ao trocar a senha (inclusive
      // esta) — por segurança, a pessoa entra de novo com a senha nova.
      setTimeout(() => {
        logout();
        router.push('/entrar');
      }, 2000);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível alterar a senha agora.'));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <section className="prof-card span-2">
      <h3>Segurança</h3>
      <p className="prof-card-sub">
        Troque a senha da sua conta. Depois de trocar, você precisa entrar de novo.
      </p>

      {trocada ? (
        <p className="prof-saved" style={{ marginTop: 14 }}>
          <Icon name="check" size={14} stroke={2.6} /> Senha alterada — redirecionando para entrar de novo…
        </p>
      ) : (
        <>
          <div className="reg-grid" style={{ marginTop: 14 }}>
            <div className="reg-field">
              <span className="reg-label">Senha atual</span>
              <input
                type="password"
                autoComplete="current-password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
              />
            </div>
            <div className="reg-row2">
              <div className="reg-field">
                <span className="reg-label">Nova senha</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div className="reg-field">
                <span className="reg-label">Confirmar nova senha</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmaSenha}
                  onChange={(e) => setConfirmaSenha(e.target.value)}
                />
              </div>
            </div>
          </div>

          {novaSenha.length > 0 && novaSenha.length < 8 && (
            <p className="reg-hint" style={{ marginTop: 8 }}>A nova senha precisa ter pelo menos 8 caracteres.</p>
          )}
          {confirmaSenha.length > 0 && novaSenha !== confirmaSenha && (
            <p className="reg-hint" style={{ marginTop: 8 }}>As senhas digitadas não coincidem.</p>
          )}

          {erro && (
            <div className="login-error" style={{ marginTop: 12 }}>
              <Icon name="close" size={14} stroke={2.4} /> {erro}
            </div>
          )}

          <button className="btn-primary" style={{ marginTop: 16 }} onClick={submit} disabled={!valida || salvando}>
            {salvando ? 'Alterando…' : 'Alterar senha'}
          </button>
        </>
      )}
    </section>
  );
}
