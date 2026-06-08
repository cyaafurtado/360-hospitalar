'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, updateMyProfile } from '../../../lib/services';
import { useAsync } from '../../../lib/useAsync';
import { useAppStore } from '../../../lib/store';
import { STATES, segmentLabel, stateName } from '../../../data/reference';
import type { SupplierProfileData } from '../../../data/types';
import { Icon } from '../../../lib/icons';
import { Logo } from '../../../components/Logo';
import { Stars } from '../../../components/Stars';
import { VerifiedTag } from '../../../components/VerifiedTag';
import { PortalNav } from '../../../components/PortalNav';
import { Loading, LoadError } from '../../../components/AsyncState';

type EditableKey = 'name' | 'tagline' | 'about' | 'site' | 'employees' | 'email' | 'phone';

export default function PerfilPage() {
  const router = useRouter();
  const authEmail = useAppStore((s) => s.authEmail);
  useEffect(() => {
    if (!authEmail) router.replace('/entrar');
  }, [authEmail, router]);

  const { data: initial, error } = useAsync(() => getMyProfile(), []);
  const [edit, setEdit] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<SupplierProfileData | null>(null);

  useEffect(() => {
    if (initial) setForm(initial);
  }, [initial]);

  const set = <K extends keyof SupplierProfileData>(k: K, v: SupplierProfileData[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const toggleUf = (u: string) =>
    setForm((f) =>
      f
        ? { ...f, atendeUfs: f.atendeUfs.includes(u) ? f.atendeUfs.filter((x) => x !== u) : [...f.atendeUfs, u] }
        : f
    );

  const save = async () => {
    if (!form) return;
    try {
      const updated = await updateMyProfile(form);
      setForm(updated);
    } catch (e) {
      console.error(e);
    }
    setEdit(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2600);
  };

  if (!form) {
    return (
      <div className="portal-screen">
        <PortalNav />
        <div className="portal-body">{error ? <LoadError message={error} /> : <Loading />}</div>
      </div>
    );
  }

  const renderRow = (label: string, value: string, k: EditableKey, type?: 'area') => (
    <div className="prof-row">
      <span className="prof-label">{label}</span>
      {edit ? (
        type === 'area' ? (
          <textarea className="prof-input" rows={3} value={form[k]} onChange={(e) => set(k, e.target.value)} />
        ) : (
          <input className="prof-input" value={form[k]} onChange={(e) => set(k, e.target.value)} />
        )
      ) : (
        <span className="prof-value">{value}</span>
      )}
    </div>
  );

  return (
    <div className="portal-screen">
      <PortalNav />
      <div className="portal-body">
        <header className="portal-head row">
          <div>
            <h1>Meu perfil</h1>
            <p className="muted">Dados que aparecem para clínicas e hospitais na busca.</p>
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

        <div className="prof-hero">
          <Logo name={form.name} size={72} radius="var(--logo-radius-lg)" />
          <div className="prof-hero-main">
            <div className="prof-hero-top">
              <h2>{form.name}</h2>
              {form.verified && <VerifiedTag />}
            </div>
            <div className="prof-hero-seg">{segmentLabel(form.segment)}</div>
            <p className="prof-hero-tag">{form.tagline}</p>
          </div>
          <div className="prof-rate">
            <div className="prof-rate-num">{form.rating.toFixed(1)}</div>
            <Stars value={form.rating} size={14} />
            <span className="muted">{form.reviews} avaliações</span>
          </div>
        </div>

        <div className="prof-grid">
          <section className="prof-card">
            <h3>Dados da empresa</h3>
            {renderRow('Nome', form.name, 'name')}
            {renderRow('Frase de destaque', form.tagline, 'tagline')}
            {renderRow('Sobre', form.about, 'about', 'area')}
            {renderRow('Site', form.site, 'site')}
            {renderRow('Porte', form.employees + ' func.', 'employees')}
          </section>

          <section className="prof-card">
            <h3>Contato</h3>
            {renderRow('E-mail', form.email, 'email')}
            {renderRow('Telefone', form.phone, 'phone')}
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
            <h3>Área de atuação — estados onde atende</h3>
            {edit ? (
              <div className="uf-grid">
                {STATES.map((s) => (
                  <button
                    key={s.uf}
                    type="button"
                    title={s.name}
                    className={'uf-chip' + (form.atendeUfs.includes(s.uf) ? ' on' : '')}
                    onClick={() => toggleUf(s.uf)}
                  >
                    {s.uf}
                  </button>
                ))}
              </div>
            ) : (
              <div className="prof-uf-list">
                {form.atendeUfs.length === 0 ? (
                  <span className="muted">Nenhum estado informado.</span>
                ) : (
                  form.atendeUfs.map((u) => (
                    <span key={u} className="uf-tag big">
                      {u} <span className="cell-sub">{stateName(u)}</span>
                    </span>
                  ))
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
