'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../../lib/store';
import { useAsync } from '../../../lib/useAsync';
import { getMinhaInstituicao, criarInstituicao, mensagemDeErro } from '../../../lib/services';
import { STATES } from '../../../data/reference';
import type { Instituicao, TipoInstituicao } from '../../../data/types';
import { Icon } from '../../../lib/icons';
import { PainelNav } from '../../../components/PainelNav';
import { Loading, LoadError } from '../../../components/AsyncState';

const TIPO_LABEL: Record<TipoInstituicao, string> = {
  clinica: 'Clínica',
  hosp_priv: 'Hospital Privado',
  hosp_pub: 'Hospital Público',
  orgao_pub: 'Órgão Público',
};
const CNES_TIPOS: TipoInstituicao[] = ['clinica', 'hosp_priv', 'hosp_pub'];

export default function PainelPerfilPage() {
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);
  const hydrated = useAppStore((s) => s.hydrated);
  useEffect(() => {
    if (hydrated && !authEmail) router.replace('/entrar');
  }, [hydrated, authEmail, router]);

  const { data: initial, loading, error } = useAsync(() => getMinhaInstituicao(), []);
  const [edit, setEdit] = useState(false);
  const [saved, setSaved] = useState(false);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState<Instituicao | null>(null);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = <K extends keyof Instituicao>(k: K, v: Instituicao[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const save = async () => {
    if (!form) return;
    setErro('');
    try {
      const atualizado = await criarInstituicao({
        tipo: form.tipo,
        name: form.name,
        cnpj: form.cnpj,
        cnes: form.cnes,
        endereco: form.endereco,
        uf: form.uf,
        city: form.city,
        about: form.about,
        email: form.email,
        phone: form.phone,
        emailFinanceiro: form.emailFinanceiro,
      });
      setForm(atualizado);
      setEdit(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2600);
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível salvar as alterações.'));
    }
  };

  if (loading || error) {
    return (
      <div className="portal-screen">
        <PainelNav />
        <div className="portal-body">{error ? <LoadError message={error} /> : <Loading />}</div>
      </div>
    );
  }

  // Cadastro ainda não finalizado: mesmo aviso de /painel, mas aqui com o
  // destino certo pra quem clicou direto em "Meu perfil".
  if (!form) {
    return (
      <div className="portal-screen">
        <PainelNav />
        <div className="portal-body">
          <div className="empty">
            <Icon name="clipboard" size={32} />
            <h3>Cadastro ainda não finalizado</h3>
            <p>Finalize o cadastro da sua instituição para ver e editar o perfil aqui.</p>
            <button className="btn-primary" onClick={() => router.push('/cadastrar')}>
              Finalizar cadastro <Icon name="arrow" size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Precisa pelo menos de cidade e estado pra valer mostrar um mapa — só UF
  // ou só o texto livre do endereço, sem cidade, dá um resultado inútil.
  const enderecoParaMapa = form.city && form.uf
    ? [form.endereco, form.city, form.uf].filter(Boolean).join(', ')
    : '';

  return (
    <div className="portal-screen">
      <PainelNav />
      <div className="portal-body">
        <header className="portal-head row">
          <div>
            <h1>Meu perfil</h1>
            <p className="muted">Dados da sua instituição.</p>
          </div>
          <div className="portal-head-actions">
            {saved && (
              <span className="prof-saved">
                <Icon name="check" size={14} stroke={2.6} /> Alterações salvas
              </span>
            )}
            {edit ? (
              <>
                <button className="btn-ghost" onClick={() => setEdit(false)}>Cancelar</button>
                <button className="btn-primary" onClick={save}>
                  <Icon name="check" size={15} stroke={2.4} /> Salvar
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => setEdit(true)}>
                <Icon name="sliders" size={15} /> Editar perfil
              </button>
            )}
          </div>
        </header>

        {erro && (
          <div className="login-error" style={{ marginBottom: 16 }}>
            <Icon name="close" size={14} stroke={2.4} /> {erro}
          </div>
        )}

        <div className="prof-grid">
          <section className="prof-card">
            <h3>Dados da instituição</h3>
            <div className="prof-row">
              <span className="prof-label">Tipo</span>
              <span className="prof-value">{TIPO_LABEL[form.tipo]}</span>
            </div>
            <div className="prof-row">
              <span className="prof-label">Nome</span>
              {edit ? (
                <input className="prof-input" value={form.name} onChange={(e) => set('name', e.target.value)} />
              ) : (
                <span className="prof-value">{form.name}</span>
              )}
            </div>
            {/* CNPJ e CNES são identificadores oficiais — não ficam abertos
                pra edição casual, nem em modo de edição. O selo de
                verificação aparece junto de cada um. */}
            <div className="prof-row">
              <span className="prof-label">CNPJ</span>
              <span className="prof-value" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {form.cnpj || '—'}
                <span className={'doc-verif-badge ' + form.status}>
                  {form.status === 'em_analise' && (<><Icon name="signal" size={11} stroke={2.4} /> Em análise</>)}
                  {form.status === 'aprovado' && (<><Icon name="check" size={11} stroke={3} /> Verificado</>)}
                  {form.status === 'rejeitado' && (<><Icon name="close" size={11} stroke={2.6} /> Não confirmado</>)}
                </span>
              </span>
              {form.status === 'rejeitado' && form.motivoRejeicao && (
                <span className="doc-verif-reason">{form.motivoRejeicao}</span>
              )}
            </div>
            {CNES_TIPOS.includes(form.tipo) && (
              <div className="prof-row">
                <span className="prof-label">CNES</span>
                <span className="prof-value" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {form.cnes || '—'}
                  <span className={'doc-verif-badge ' + form.status}>
                    {form.status === 'em_analise' && (<><Icon name="signal" size={11} stroke={2.4} /> Em análise</>)}
                    {form.status === 'aprovado' && (<><Icon name="check" size={11} stroke={3} /> Verificado</>)}
                    {form.status === 'rejeitado' && (<><Icon name="close" size={11} stroke={2.6} /> Não confirmado</>)}
                  </span>
                </span>
              </div>
            )}
            <div className="prof-row">
              <span className="prof-label">Sobre</span>
              {edit ? (
                <textarea className="prof-input" rows={3} value={form.about} onChange={(e) => set('about', e.target.value)} />
              ) : (
                <span className="prof-value">{form.about || '—'}</span>
              )}
            </div>
          </section>

          <section className="prof-card">
            <h3>Contato</h3>
            <div className="prof-row">
              <span className="prof-label">E-mail</span>
              {edit ? (
                <input className="prof-input" value={form.email} onChange={(e) => set('email', e.target.value)} />
              ) : (
                <span className="prof-value">{form.email || '—'}</span>
              )}
            </div>
            <div className="prof-row">
              <span className="prof-label">Telefone</span>
              {edit ? (
                <input className="prof-input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              ) : (
                <span className="prof-value">{form.phone || '—'}</span>
              )}
            </div>
            <div className="prof-row">
              <span className="prof-label">E-mail para nota fiscal / financeiro</span>
              {edit ? (
                <input
                  className="prof-input"
                  type="email"
                  value={form.emailFinanceiro}
                  onChange={(e) => set('emailFinanceiro', e.target.value)}
                  placeholder="financeiro@instituicao.com.br"
                />
              ) : (
                <span className="prof-value">{form.emailFinanceiro || '—'}</span>
              )}
            </div>
            <div className="prof-row">
              <span className="prof-label">Endereço</span>
              {edit ? (
                <input
                  className="prof-input"
                  value={form.endereco}
                  onChange={(e) => set('endereco', e.target.value)}
                  placeholder="Rua, número, bairro"
                />
              ) : (
                <span className="prof-value">{form.endereco || '—'}</span>
              )}
            </div>
            <div className="prof-row">
              <span className="prof-label">Cidade / Estado</span>
              {edit ? (
                <div className="prof-2col">
                  <input className="prof-input" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Cidade" />
                  <select className="prof-input" value={form.uf} onChange={(e) => set('uf', e.target.value)}>
                    {STATES.map((s) => (
                      <option key={s.uf} value={s.uf}>{s.uf}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <span className="prof-value">{form.city} · {form.uf}</span>
              )}
            </div>
          </section>

          <section className="prof-card span-2">
            <h3>Localização</h3>
            {enderecoParaMapa ? (
              <iframe
                className="inst-map"
                title="Mapa do endereço da instituição"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(enderecoParaMapa)}&output=embed`}
              />
            ) : (
              <p className="doc-empty-hint">Preencha cidade e estado (e, se possível, o endereço) para ver o mapa aqui.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
