'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMyProfile, updateMyProfile } from '../../../lib/services';
import { useAsync } from '../../../lib/useAsync';
import { useAppStore } from '../../../lib/store';
import { STATES, segmentLabel, stateName } from '../../../data/reference';
import type { SupplierProfileData, DocumentoVerificacao, CatalogoServico } from '../../../data/types';
import { Icon } from '../../../lib/icons';
import { Logo } from '../../../components/Logo';
import { Stars } from '../../../components/Stars';
import { VerifiedTag } from '../../../components/VerifiedTag';
import { PortalNav } from '../../../components/PortalNav';
import { Loading, LoadError } from '../../../components/AsyncState';

type EditableKey = 'name' | 'tagline' | 'about' | 'site' | 'employees' | 'email' | 'phone';

const DOC_PRESETS = [
  'ANVISA', 'ISO 9001', 'ISO 13485', 'ISO 27001', 'LGPD', 'RDC 222',
  'Inmetro', 'NR-32', 'IBAMA', 'Boas Práticas', 'Licença Sanitária',
  'Alvará de Funcionamento', 'Licença Ambiental', 'CRM', 'COREN', 'CRF',
  'Certidão Negativa Federal', 'Certidão Negativa Estadual', 'Outro',
];

const docStatus = (validade: string): 'ok' | 'warn' | 'err' | 'none' => {
  if (!validade) return 'none';
  const diff = Math.ceil((new Date(validade + 'T00:00:00').getTime() - Date.now()) / 86400000);
  if (diff < 0) return 'err';
  if (diff <= 60) return 'warn';
  return 'ok';
};

const fmtDate = (iso: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

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

  // attachMap: docId → lista de {name, url?} (url = blob URL para arquivos desta sessão)
  type Att = { name: string; url?: string };
  const [attachMap, setAttachMap] = useState<Record<string, Att[]>>({});

  useEffect(() => {
    if (initial?.documentos) {
      const init: Record<string, Att[]> = {};
      for (const doc of initial.documentos) {
        if (doc.arquivos?.length) init[doc.id] = doc.arquivos.map((name) => ({ name }));
      }
      setAttachMap(init);
    }
  }, [initial]);

  const getAtts = (docId: string): Att[] => attachMap[docId] ?? [];

  const docs = form?.documentos ?? [];
  const addDoc = () =>
    setForm((f) =>
      f ? { ...f, documentos: [...(f.documentos ?? []), { id: crypto.randomUUID(), tipo: '', numero: '', validade: '', arquivos: [] }] } : f
    );
  const removeDoc = (id: string) => {
    setAttachMap((p) => { const n = { ...p }; delete n[id]; return n; });
    setForm((f) => f ? { ...f, documentos: (f.documentos ?? []).filter((d) => d.id !== id) } : f);
  };
  const setDoc = (id: string, k: keyof DocumentoVerificacao, v: string) =>
    setForm((f) =>
      f ? { ...f, documentos: (f.documentos ?? []).map((d) => d.id === id ? { ...d, [k]: v } : d) } : f
    );
  const addDocFile = (docId: string, file: File) => {
    const url = URL.createObjectURL(file);
    setAttachMap((p) => ({ ...p, [docId]: [...(p[docId] ?? []), { name: file.name, url }] }));
    setForm((f) =>
      f ? { ...f, documentos: (f.documentos ?? []).map((d) =>
        d.id === docId ? { ...d, arquivos: [...(d.arquivos ?? []), file.name] } : d
      )} : f
    );
  };
  const removeDocFile = (docId: string, idx: number) => {
    setAttachMap((p) => {
      const arr = [...(p[docId] ?? [])];
      arr.splice(idx, 1);
      return { ...p, [docId]: arr };
    });
    setForm((f) =>
      f ? { ...f, documentos: (f.documentos ?? []).map((d) => {
        if (d.id !== docId) return d;
        const arqs = [...(d.arquivos ?? [])];
        arqs.splice(idx, 1);
        return { ...d, arquivos: arqs };
      })} : f
    );
  };

  // fotos da empresa
  type Photo = { name: string; url: string };
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    if (initial?.fotos?.length) {
      setPhotos(initial.fotos.map((name) => ({ name, url: '' })));
    }
  }, [initial]);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const entries = Array.from(files).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
    setPhotos((p) => [...p, ...entries]);
    setForm((f) => f ? { ...f, fotos: [...(f.fotos ?? []), ...entries.map((e) => e.name)] } : f);
  };
  const removePhoto = (idx: number) => {
    setPhotos((p) => p.filter((_, i) => i !== idx));
    setForm((f) => f ? { ...f, fotos: (f.fotos ?? []).filter((_, i) => i !== idx) } : f);
  };

  // ── Catálogo de serviços ──────────────────────────────────────────
  const MOCK_CATALOGO: Record<string, Omit<CatalogoServico, 'id'>[]> = {
    esteril: [
      { nome: 'Esterilização em autoclave a vapor', descricao: 'Processamento de artigos críticos e semicríticos conforme RDC 15/2012. Coleta e entrega incluídas.', preco: 'R$ 4,50 / artigo', prazo: '24h', destaque: true },
      { nome: 'Esterilização por óxido de etileno', descricao: 'Para artigos sensíveis ao calor. Validação documentada e rastreabilidade por lote.', preco: 'R$ 12,00 / artigo', prazo: '72h', destaque: false },
      { nome: 'Auditoria e consultoria de CME', descricao: 'Avaliação do processo de esterilização da central de materiais e elaboração de plano de adequação.', preco: 'Sob consulta', prazo: '5 dias úteis', destaque: false },
    ],
    equip: [
      { nome: 'Fornecimento de equipamentos médicos', descricao: 'Venda e locação de equipamentos hospitalares com garantia estendida e suporte técnico.', preco: 'A partir de R$ 800/mês', prazo: 'Imediato', destaque: true },
      { nome: 'Manutenção preventiva', descricao: 'Plano anual de manutenção preventiva com cronograma e relatórios mensais.', preco: 'A partir de R$ 350/mês', prazo: 'Agendado', destaque: true },
      { nome: 'Calibração e qualificação', descricao: 'Calibração de equipamentos com emissão de certificado rastreável ao INMETRO.', preco: 'R$ 180 / equipamento', prazo: '3 dias úteis', destaque: false },
    ],
    ti: [
      { nome: 'Prontuário eletrônico do paciente (PEP)', descricao: 'Sistema completo com agendamento, prescrição digital e integração TISS/TUSS.', preco: 'A partir de R$ 290/mês', prazo: 'Implantação em 30 dias', destaque: true },
      { nome: 'Business intelligence hospitalar', descricao: 'Dashboards de desempenho clínico e operacional com integração a sistemas legados.', preco: 'Sob consulta', prazo: 'Projeto personalizado', destaque: false },
      { nome: 'Suporte técnico e treinamento', descricao: 'Suporte 8×5 com SLA garantido e treinamento presencial ou remoto para equipes.', preco: 'Incluso no plano', prazo: 'Resposta em até 4h', destaque: false },
    ],
    lab: [
      { nome: 'Exames laboratoriais de rotina', descricao: 'Hemograma, bioquímica, hormônios e coagulação com laudos em até 6 horas.', preco: 'Tabela CBHPM', prazo: '6h', destaque: true },
      { nome: 'Análise microbiológica', descricao: 'Culturas, antibiograma e identificação de microrganismos com relatório detalhado.', preco: 'R$ 85,00 / análise', prazo: '48–72h', destaque: false },
    ],
    gases: [
      { nome: 'Fornecimento de O₂ medicinal', descricao: 'Cilindros e concentradores de oxigênio para UTI e enfermaria com monitoramento remoto.', preco: 'R$ 3,20 / m³', prazo: 'Entrega em 24h', destaque: true },
      { nome: 'Gases especiais para anestesia', descricao: 'N₂O, ar comprimido medicinal e mistura de gases para centro cirúrgico.', preco: 'Sob consulta', prazo: '48h', destaque: false },
      { nome: 'Instalação de rede de gases', descricao: 'Projeto e instalação de centrais de gases com válvulas reguladoras e alarmes.', preco: 'Orçamento por m²', prazo: 'Projeto personalizado', destaque: false },
    ],
  };

  const DEFAULT_MOCK: Omit<CatalogoServico, 'id'>[] = [
    { nome: 'Serviço principal', descricao: 'Descreva aqui o seu serviço mais importante com todos os detalhes que o comprador precisa saber.', preco: 'Sob consulta', prazo: 'A combinar', destaque: true },
    { nome: 'Pacote completo', descricao: 'Solução integrada que cobre todas as etapas do processo, da contratação ao suporte pós-venda.', preco: 'Sob consulta', prazo: 'A combinar', destaque: false },
  ];

  const seedCatalogo = (segment: string): CatalogoServico[] =>
    (MOCK_CATALOGO[segment] ?? DEFAULT_MOCK).map((s) => ({ ...s, id: crypto.randomUUID() }));

  const [catalogo, setCatalogo] = useState<CatalogoServico[]>([]);

  useEffect(() => {
    if (initial) {
      setCatalogo(initial.catalogo?.length ? initial.catalogo : seedCatalogo(initial.segment));
    }
  }, [initial]);

  const addServico = () =>
    setCatalogo((c) => [...c, { id: crypto.randomUUID(), nome: '', descricao: '', preco: '', prazo: '', destaque: false }]);

  const removeServico = (id: string) => setCatalogo((c) => c.filter((s) => s.id !== id));

  const setServico = (id: string, k: keyof CatalogoServico, v: string | boolean) =>
    setCatalogo((c) => c.map((s) => s.id === id ? { ...s, [k]: v } : s));

  const toggleDestaque = (id: string) =>
    setCatalogo((c) => c.map((s) => s.id === id ? { ...s, destaque: !s.destaque } : s));

  const save = async () => {
    if (!form) return;
    try {
      const updated = await updateMyProfile({ ...form, catalogo });
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

          {/* ── Fotos da empresa ── */}
          <section className="prof-card span-2">
            <div className="prof-doc-head">
              <h3>Fotos da empresa</h3>
              {edit && (
                <label className="prof-doc-add">
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }}
                  />
                  <Icon name="check" size={13} stroke={3} /> Adicionar fotos
                </label>
              )}
            </div>

            {photos.length === 0 && !edit && (
              <p className="doc-empty-hint">Nenhuma foto cadastrada. Edite o perfil para adicionar fotos da fachada.</p>
            )}

            {(photos.length > 0 || edit) && (
              <div className="photo-grid">
                {photos.map((p, i) => (
                  <div key={i} className="photo-cell">
                    {p.url ? (
                      <img src={p.url} alt={p.name} className="photo-img" />
                    ) : (
                      <div className="photo-placeholder">
                        <Icon name="file" size={22} />
                        <span>{p.name}</span>
                      </div>
                    )}
                    {edit && (
                      <button
                        type="button"
                        className="photo-remove"
                        onClick={() => removePhoto(i)}
                        title="Remover foto"
                      >
                        <Icon name="close" size={13} stroke={2.5} />
                      </button>
                    )}
                  </div>
                ))}
                {edit && (
                  <label className="photo-add-cell">
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }}
                    />
                    <span className="photo-add-ico">+</span>
                    <span>Adicionar foto</span>
                  </label>
                )}
              </div>
            )}
          </section>

          <section className="prof-card span-2">
            <div className="prof-doc-head">
              <h3>Documentação para verificação</h3>
              {edit && (
                <button type="button" className="prof-doc-add" onClick={addDoc}>
                  <Icon name="check" size={13} stroke={3} /> Adicionar documento
                </button>
              )}
            </div>

            {docs.length === 0 && !edit && (
              <span className="muted" style={{ fontSize: 14 }}>Nenhum documento cadastrado.</span>
            )}

            {docs.length > 0 && (
              <div className="doc-table">
                {/* cabeçalho */}
                <div className={'doc-row header' + (edit ? ' editing' : '')}>
                  <span>Tipo / Certificação</span>
                  <span>Número / Registro</span>
                  <span>Validade</span>
                  {!edit && <span>Situação</span>}
                  <span>Anexos</span>
                  {edit && <span />}
                </div>

                {docs.map((doc) => {
                  const st = docStatus(doc.validade);
                  const atts = getAtts(doc.id);
                  return (
                    <div key={doc.id} className={'doc-row' + (edit ? ' editing' : '')}>
                      {edit ? (
                        <>
                          <input
                            className="doc-input"
                            list={'doc-presets-' + doc.id}
                            placeholder="Ex: ANVISA, ISO 9001…"
                            value={doc.tipo}
                            onChange={(e) => setDoc(doc.id, 'tipo', e.target.value)}
                          />
                          <datalist id={'doc-presets-' + doc.id}>
                            {DOC_PRESETS.map((p) => <option key={p} value={p} />)}
                          </datalist>
                          <input className="doc-input" placeholder="Ex: 10.000/2023"
                            value={doc.numero} onChange={(e) => setDoc(doc.id, 'numero', e.target.value)} />
                          <input className="doc-input" type="date"
                            value={doc.validade} onChange={(e) => setDoc(doc.id, 'validade', e.target.value)} />

                          {/* coluna Anexos — chips + botão + */}
                          <div className="doc-file-list">
                            {atts.map((att, i) => (
                              <span key={i} className="doc-file-chip">
                                <Icon name="file" size={12} />
                                <span className="doc-file-name">{att.name}</span>
                                <button
                                  type="button"
                                  className="doc-file-remove"
                                  onClick={() => removeDocFile(doc.id, i)}
                                  title="Remover arquivo"
                                >
                                  <Icon name="close" size={11} stroke={2.5} />
                                </button>
                              </span>
                            ))}
                            <label className="doc-file-add">
                              <input
                                type="file"
                                hidden
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) { addDocFile(doc.id, f); e.target.value = ''; }
                                }}
                              />
                              + Anexar
                            </label>
                          </div>

                          <button type="button" className="doc-remove" onClick={() => removeDoc(doc.id)} title="Remover documento">
                            <Icon name="close" size={14} stroke={2.4} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="doc-tipo">{doc.tipo || '—'}</span>
                          <span className="doc-num">{doc.numero || '—'}</span>
                          <span className="doc-val">{fmtDate(doc.validade)}</span>
                          <span className={'doc-status ' + st}>
                            {st === 'ok'   && <><Icon name="check"  size={12} stroke={3}   /> Vigente</>}
                            {st === 'warn' && <><Icon name="signal" size={12} stroke={2}   /> A vencer</>}
                            {st === 'err'  && <><Icon name="close"  size={12} stroke={2.4} /> Vencido</>}
                            {st === 'none' && '—'}
                          </span>

                          {/* coluna Anexos em modo visualização */}
                          <div className="doc-file-list view">
                            {atts.length === 0 ? (
                              <span className="doc-attach-empty">—</span>
                            ) : atts.map((att, i) =>
                              att.url ? (
                                <a key={i} className="doc-file-chip link" href={att.url} target="_blank" rel="noreferrer" title="Abrir arquivo">
                                  <Icon name="file" size={12} />
                                  <span className="doc-file-name">{att.name}</span>
                                </a>
                              ) : (
                                <span key={i} className="doc-file-chip">
                                  <Icon name="file" size={12} />
                                  <span className="doc-file-name">{att.name}</span>
                                </span>
                              )
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {edit && docs.length === 0 && (
              <p className="doc-empty-hint">Clique em &ldquo;Adicionar documento&rdquo; para registrar certificações e licenças com validade.</p>
            )}
          </section>

          {/* ── Catálogo de serviços ── */}
          <section className="prof-card span-2">
            <div className="prof-doc-head">
              <div>
                <h3>Meu catálogo de serviços</h3>
                <p className="prof-card-sub">Serviços que aparecem na sua página pública para compradores.</p>
              </div>
              {edit && (
                <button type="button" className="prof-doc-add" onClick={addServico}>
                  <Icon name="check" size={13} stroke={3} /> Adicionar serviço
                </button>
              )}
            </div>

            {catalogo.length === 0 && !edit && (
              <p className="doc-empty-hint">Nenhum serviço cadastrado. Edite o perfil para montar seu catálogo.</p>
            )}

            <div className="catalogo-grid">
              {catalogo.map((s) => edit ? (
                <div key={s.id} className="catalogo-card editing">
                  <div className="catalogo-edit-head">
                    <button
                      type="button"
                      className={'catalogo-star' + (s.destaque ? ' on' : '')}
                      onClick={() => toggleDestaque(s.id)}
                      title={s.destaque ? 'Remover destaque' : 'Marcar como destaque'}
                    >
                      <Icon name="star" size={15} stroke={s.destaque ? 0 : 1.6} />
                    </button>
                    <button type="button" className="doc-remove" onClick={() => removeServico(s.id)}>
                      <Icon name="close" size={14} stroke={2.4} />
                    </button>
                  </div>
                  <input
                    className="prof-input catalogo-input-nome"
                    placeholder="Nome do serviço"
                    value={s.nome}
                    onChange={(e) => setServico(s.id, 'nome', e.target.value)}
                  />
                  <textarea
                    className="prof-input catalogo-input-desc"
                    rows={3}
                    placeholder="Descreva o serviço — o que inclui, diferenciais, público-alvo…"
                    value={s.descricao}
                    onChange={(e) => setServico(s.id, 'descricao', e.target.value)}
                  />
                  <div className="catalogo-edit-meta">
                    <div className="reg-field">
                      <span className="reg-label">Preço / referência</span>
                      <input
                        className="prof-input"
                        placeholder="Ex: R$ 250/mês, Sob consulta"
                        value={s.preco ?? ''}
                        onChange={(e) => setServico(s.id, 'preco', e.target.value)}
                      />
                    </div>
                    <div className="reg-field">
                      <span className="reg-label">Prazo estimado</span>
                      <input
                        className="prof-input"
                        placeholder="Ex: 24h, 5 dias úteis"
                        value={s.prazo ?? ''}
                        onChange={(e) => setServico(s.id, 'prazo', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div key={s.id} className={'catalogo-card' + (s.destaque ? ' destaque' : '')}>
                  {s.destaque && (
                    <span className="catalogo-badge">
                      <Icon name="star" size={11} /> Destaque
                    </span>
                  )}
                  <div className="catalogo-nome">{s.nome || '—'}</div>
                  <p className="catalogo-desc">{s.descricao || '—'}</p>
                  {(s.preco || s.prazo) && (
                    <div className="catalogo-meta">
                      {s.preco && (
                        <span className="catalogo-meta-item">
                          <Icon name="file" size={13} /> {s.preco}
                        </span>
                      )}
                      {s.prazo && (
                        <span className="catalogo-meta-item">
                          <Icon name="clock" size={13} /> {s.prazo}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {edit && (
                <button type="button" className="catalogo-add-card" onClick={addServico}>
                  <Icon name="check" size={20} stroke={1.4} />
                  <span>Novo serviço</span>
                </button>
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
