'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SEGMENTS, STATES } from '../../data/reference';
import type { Plan } from '../../data/types';
import { Icon } from '../../lib/icons';
import { maskCNPJ, maskCard, maskExp } from '../../lib/masks';
import { Field } from '../../components/Field';
import { PreviewCard } from '../../components/PreviewCard';
import { createCompany } from '../../lib/services';

type RegisterForm = {
  name: string; cnpj: string; site: string; about: string;
  segment: string; uf: string; city: string; tagline: string; atendeUfs: string[];
  email: string; phone: string; employees: string; badges: string[]; terms: boolean;
  conselho: string; conselhoNum: string; plan: Plan;
  card?: string; cardName?: string; cardExp?: string; cardCvv?: string;
};

const PORTES = ['1–10', '10–50', '50–200', '200–500', '500–1.000', '1.000+'];
const CERT_OPTS = ['ANVISA', 'ISO 9001', 'ISO 13485', 'ISO 27001', 'LGPD', 'RDC 222', 'Inmetro', 'NR-32', 'IBAMA', 'Boas Práticas'];
const CONSELHOS = ['CRM', 'COREN', 'CRF', 'CRO', 'CRBM', 'CRN', 'CRP', 'CREFITO', 'CRMV', 'CREA', 'Outro'];

const REG_STEPS: { key: string; label: string; fields: (keyof RegisterForm)[] }[] = [
  { key: 'dados', label: 'Dados da empresa', fields: ['name', 'cnpj', 'site', 'about'] },
  { key: 'atuacao', label: 'Área de atuação', fields: ['segment', 'uf', 'city', 'tagline'] },
  { key: 'contato', label: 'Contato & selos', fields: ['email', 'phone'] },
  { key: 'plano', label: 'Plano & verificação', fields: [] },
];

const INITIAL: RegisterForm = {
  name: '', cnpj: '', site: '', about: '', segment: '', uf: '', city: '', tagline: '',
  atendeUfs: [], email: '', phone: '', employees: '', badges: [], terms: false,
  conselho: '', conselhoNum: '', plan: 'free',
};

export default function CadastrarPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<RegisterForm>({ ...INITIAL });

  const set = <K extends keyof RegisterForm>(k: K, v: RegisterForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const toggleBadge = (b: string) =>
    setForm((f) => ({ ...f, badges: f.badges.includes(b) ? f.badges.filter((x) => x !== b) : [...f.badges, b] }));
  const toggleUf = (u: string) =>
    setForm((f) => ({ ...f, atendeUfs: f.atendeUfs.includes(u) ? f.atendeUfs.filter((x) => x !== u) : [...f.atendeUfs, u] }));
  const allUfs = () =>
    setForm((f) => ({ ...f, atendeUfs: f.atendeUfs.length === STATES.length ? [] : STATES.map((s) => s.uf) }));

  const stepValid = (): boolean => {
    const req = REG_STEPS[step].fields;
    if (!req.every((k) => String(form[k] ?? '').trim())) return false;
    if (step === 1 && form.atendeUfs.length === 0) return false;
    if (step === 2 && !form.terms) return false;
    if (step === 3 && form.plan === 'premium') {
      const c: (keyof RegisterForm)[] = ['card', 'cardName', 'cardExp', 'cardCvv'];
      if (!c.every((k) => String(form[k] ?? '').trim())) return false;
    }
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      await createCompany({
        name: form.name, segment: form.segment, tagline: form.tagline, city: form.city, uf: form.uf,
        atendeUfs: form.atendeUfs, employees: form.employees, badges: form.badges, about: form.about,
        phone: form.phone, site: form.site, email: form.email,
      });
    } catch (e) {
      console.error('Falha ao enviar cadastro:', e);
    } finally {
      setSubmitting(false);
      setDone(true);
      window.scrollTo({ top: 0 });
    }
  };

  const next = () => {
    if (step < REG_STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0 });
    } else {
      void submit();
    }
  };
  const back = () => step > 0 && setStep(step - 1);

  if (done) {
    return (
      <div className="screen register">
        <div className="reg-success">
          <div className="success-mark">
            <Icon name="check" size={34} stroke={2.6} />
          </div>
          <h1>{form.plan === 'premium' ? 'Pagamento confirmado!' : 'Cadastro enviado!'}</h1>
          {form.plan === 'premium' ? (
            <p>
              Recebemos o cadastro de <strong>{form.name}</strong> e a assinatura do{' '}
              <strong>Destaque Premium</strong> (R$ 19,90/mês). Vamos auditar seus documentos e ativar o
              destaque em até <strong>2 dias úteis</strong> — confirmação em <strong>{form.email}</strong>.
            </p>
          ) : form.plan === 'verified' ? (
            <p>
              Recebemos o cadastro de <strong>{form.name}</strong> e a solicitação de{' '}
              <strong>verificação gratuita</strong>. Nossa equipe audita os documentos e ativa o selo em até{' '}
              <strong>2 dias úteis</strong> — aviso em <strong>{form.email}</strong>.
            </p>
          ) : (
            <p>
              Recebemos os dados de <strong>{form.name}</strong>. Seu perfil já entra na busca e você recebe
              contatos diretamente em <strong>{form.email}</strong>.
            </p>
          )}
          <div className="success-preview">
            <span className="reg-aside-title">Assim seu perfil aparecerá na busca</span>
            <PreviewCard
              name={form.name}
              segment={form.segment}
              tagline={form.tagline}
              uf={form.uf}
              verified={form.plan === 'verified' || form.plan === 'premium'}
            />
          </div>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => router.push('/')}>
              Voltar ao início
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                setDone(false);
                setStep(0);
                setForm({ ...INITIAL });
              }}
            >
              Cadastrar outra empresa
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen register">
      <button className="back-link" onClick={() => router.push('/')}>
        <Icon name="back" size={16} /> Voltar ao início
      </button>

      <header className="reg-hero">
        <div className="hero-eyebrow">Para fornecedores</div>
        <h1>Cadastre sua empresa na 360 Hospitalar</h1>
        <p>
          Seja encontrado por milhares de clínicas e hospitais que buscam fornecedores confiáveis. Cadastro
          gratuito, perfil verificado e contato direto com compradores.
        </p>
      </header>

      <div className="reg-body">
        <div className="reg-form-col">
          <ol className="reg-steps">
            {REG_STEPS.map((s, i) => (
              <li key={s.key} className={'reg-step' + (i === step ? ' on' : '') + (i < step ? ' did' : '')}>
                <span className="reg-step-num">{i < step ? <Icon name="check" size={14} stroke={3} /> : i + 1}</span>
                <span className="reg-step-label">{s.label}</span>
              </li>
            ))}
          </ol>

          <div className="reg-card">
            {step === 0 && (
              <div className="reg-grid">
                <Field label="Nome da empresa" required>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Ex: MedLab Diagnósticos" />
                </Field>
                <Field label="CNPJ" required hint="Usado para verificação cadastral.">
                  <input value={form.cnpj} onChange={(e) => set('cnpj', maskCNPJ(e.target.value))} placeholder="00.000.000/0000-00" inputMode="numeric" />
                </Field>
                <Field label="Site" required>
                  <input value={form.site} onChange={(e) => set('site', e.target.value)} placeholder="suaempresa.com.br" />
                </Field>
                <Field label="Sobre a empresa" required>
                  <textarea rows={4} value={form.about} onChange={(e) => set('about', e.target.value)} placeholder="Descreva o que sua empresa faz, diferenciais e quem atende." />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div className="reg-grid">
                <Field label="Segmento principal" required>
                  <div className="reg-select">
                    <Icon name="filter" size={16} />
                    <select value={form.segment} onChange={(e) => set('segment', e.target.value)}>
                      <option value="">Selecione um segmento</option>
                      {SEGMENTS.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </Field>
                <div className="reg-row2">
                  <Field label="Estado (sede)" required>
                    <div className="reg-select">
                      <Icon name="pin" size={16} />
                      <select value={form.uf} onChange={(e) => set('uf', e.target.value)}>
                        <option value="">UF</option>
                        {STATES.map((s) => (
                          <option key={s.uf} value={s.uf}>{s.name} ({s.uf})</option>
                        ))}
                      </select>
                    </div>
                  </Field>
                  <Field label="Cidade" required>
                    <input value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Ex: Campinas" />
                  </Field>
                </div>
                <Field label="Estados onde atua e atende" required hint="Selecione todas as UFs que sua empresa cobre.">
                  <div className="uf-grid-head">
                    <span className="uf-count">
                      {form.atendeUfs.length} selecionado{form.atendeUfs.length === 1 ? '' : 's'}
                    </span>
                    <button type="button" className="uf-all" onClick={allUfs}>
                      {form.atendeUfs.length === STATES.length ? 'Limpar todos' : 'Atende todo o Brasil'}
                    </button>
                  </div>
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
                </Field>
                <Field label="Porte (funcionários)">
                  <div className="reg-chips-row">
                    {PORTES.map((p) => (
                      <button key={p} type="button" className={'reg-pick' + (form.employees === p ? ' on' : '')} onClick={() => set('employees', p)}>
                        {p}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Frase de destaque" required hint="Aparece no card de busca — seja direto.">
                  <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Ex: Apoio laboratorial 24h para redes de saúde" maxLength={90} />
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="reg-grid">
                <div className="reg-row2">
                  <Field label="E-mail de contato" required>
                    <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="contato@suaempresa.com.br" />
                  </Field>
                  <Field label="Telefone" required>
                    <input value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(00) 0000-0000" />
                  </Field>
                </div>
                <Field label="Certificações e selos" hint="Marque os que sua empresa possui — entram na verificação.">
                  <div className="reg-chips-row wrap">
                    {CERT_OPTS.map((cert) => (
                      <button key={cert} type="button" className={'reg-pick' + (form.badges.includes(cert) ? ' on' : '')} onClick={() => toggleBadge(cert)}>
                        {form.badges.includes(cert) && <Icon name="check" size={12} stroke={3} />} {cert}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Conselho de classe do responsável técnico" hint="Registro do RT no conselho profissional — reforça a verificação.">
                  <div className="reg-row2 conselho-row">
                    <div className="reg-select">
                      <Icon name="shield2" size={16} />
                      <select value={form.conselho} onChange={(e) => set('conselho', e.target.value)}>
                        <option value="">Selecione o conselho</option>
                        {CONSELHOS.map((co) => (
                          <option key={co} value={co}>{co}</option>
                        ))}
                      </select>
                    </div>
                    <input
                      value={form.conselhoNum}
                      onChange={(e) => set('conselhoNum', e.target.value)}
                      placeholder={form.conselho ? `Nº de registro (ex: ${form.conselho}/SP 12345)` : 'Nº de registro'}
                      disabled={!form.conselho}
                    />
                  </div>
                </Field>
                <label className="reg-terms">
                  <input type="checkbox" checked={form.terms} onChange={(e) => set('terms', e.target.checked)} />
                  <span className="fr-box">
                    <Icon name="check" size={12} stroke={3} />
                  </span>
                  <span>
                    Declaro que as informações são verdadeiras e aceito os <a>termos de uso</a> e a{' '}
                    <a>política de privacidade</a> da 360 Hospitalar.
                  </span>
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="reg-grid">
                <div className="plan-intro">
                  <h3>Escolha como sua empresa aparece</h3>
                  <p>
                    Publique gratuitamente, solicite a <strong>verificação sem custo</strong> ou amplie o
                    alcance com o <strong>Destaque Premium</strong>.
                  </p>
                </div>

                <div className="plan-grid plan-grid-3">
                  <button type="button" className={'plan-card' + (form.plan === 'free' ? ' on' : '')} onClick={() => set('plan', 'free')}>
                    <span className="plan-radio"><Icon name="check" size={13} stroke={3} /></span>
                    <div className="plan-head col">
                      <span className="plan-name">Básico</span>
                      <span className="plan-price"><strong>Grátis</strong></span>
                    </div>
                    <p className="plan-desc">Perfil público na busca, com selo &quot;Novo&quot;.</p>
                    <ul className="plan-feats">
                      <li><Icon name="check" size={14} stroke={2.6} /> <span>Listagem na busca</span></li>
                      <li><Icon name="check" size={14} stroke={2.6} /> <span>Página de perfil completa</span></li>
                      <li><Icon name="check" size={14} stroke={2.6} /> <span>Contato direto de compradores</span></li>
                    </ul>
                  </button>

                  <button type="button" className={'plan-card verified-plan' + (form.plan === 'verified' ? ' on' : '')} onClick={() => set('plan', 'verified')}>
                    <span className="plan-radio"><Icon name="check" size={13} stroke={3} /></span>
                    <div className="plan-head col">
                      <span className="plan-name">
                        <span className="verified sm"><Icon name="check" size={11} stroke={2.4} /> Verificada</span>
                      </span>
                      <span className="plan-price"><strong>Gratuita</strong><small>mediante análise</small></span>
                    </div>
                    <p className="plan-desc">Selo de verificação após auditoria dos documentos.</p>
                    <ul className="plan-feats">
                      <li><Icon name="check" size={14} stroke={2.6} /> <span>Tudo do plano Básico</span></li>
                      <li><Icon name="check" size={14} stroke={2.6} /> <span><strong>Selo Verificada</strong> no seu perfil</span></li>
                      <li><Icon name="check" size={14} stroke={2.6} /> <span>Auditoria de documentos e certificações</span></li>
                    </ul>
                    <span className="plan-note">Análise em até 2 dias úteis · sem custo</span>
                  </button>

                  <button type="button" className={'plan-card premium-plan' + (form.plan === 'premium' ? ' on' : '')} onClick={() => set('plan', 'premium')}>
                    <span className="plan-flag">Recomendado</span>
                    <span className="plan-radio"><Icon name="check" size={13} stroke={3} /></span>
                    <div className="plan-head col">
                      <span className="plan-name"><Icon name="star" size={15} stroke={2} /> Destaque Premium</span>
                      <span className="plan-price"><strong>R$ 19,90</strong><small>/mês</small></span>
                    </div>
                    <p className="plan-desc">Selo verificado + prioridade no topo da busca.</p>
                    <ul className="plan-feats">
                      <li><Icon name="check" size={14} stroke={2.6} /> <span>Tudo da Verificação</span></li>
                      <li><Icon name="check" size={14} stroke={2.6} /> <span><strong>Destaque no topo</strong> dos resultados</span></li>
                      <li><Icon name="check" size={14} stroke={2.6} /> <span>Métricas de visibilidade</span></li>
                    </ul>
                    <span className="plan-note">Cancele quando quiser · sem fidelidade</span>
                  </button>
                </div>

                {form.plan === 'premium' && (
                  <div className="pay-box">
                    <div className="pay-head">
                      <Icon name="star" size={18} stroke={2} />
                      <span>Pagamento do Destaque Premium</span>
                      <span className="pay-total">R$ 19,90<small>/mês</small></span>
                    </div>
                    <div className="reg-row2">
                      <Field label="Número do cartão" required>
                        <input value={form.card || ''} onChange={(e) => set('card', maskCard(e.target.value))} placeholder="0000 0000 0000 0000" inputMode="numeric" />
                      </Field>
                      <Field label="Nome no cartão" required>
                        <input value={form.cardName || ''} onChange={(e) => set('cardName', e.target.value)} placeholder="Como impresso no cartão" />
                      </Field>
                    </div>
                    <div className="reg-row2">
                      <Field label="Validade" required>
                        <input value={form.cardExp || ''} onChange={(e) => set('cardExp', maskExp(e.target.value))} placeholder="MM/AA" inputMode="numeric" />
                      </Field>
                      <Field label="CVV" required>
                        <input value={form.cardCvv || ''} onChange={(e) => set('cardCvv', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="000" inputMode="numeric" />
                      </Field>
                    </div>
                    <div className="pay-secure">
                      <Icon name="shield2" size={13} /> Pagamento criptografado · primeira cobrança hoje, renova mensalmente.
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="reg-nav">
              {step > 0 ? (
                <button className="btn-ghost" onClick={back}>
                  <Icon name="back" size={15} /> Voltar
                </button>
              ) : (
                <span />
              )}
              <button className="btn-primary" disabled={!stepValid() || submitting} onClick={next}>
                {step < REG_STEPS.length - 1 ? (
                  <>Continuar <Icon name="arrow" size={15} /></>
                ) : submitting ? (
                  'Enviando…'
                ) : form.plan === 'premium' ? (
                  <>Pagar R$ 19,90 e enviar <Icon name="check" size={15} stroke={2.5} /></>
                ) : (
                  <>Enviar cadastro <Icon name="check" size={15} stroke={2.5} /></>
                )}
              </button>
            </div>
          </div>
        </div>

        <aside className="reg-aside">
          <div className="reg-aside-block">
            <span className="reg-aside-title">Prévia do seu perfil</span>
            <PreviewCard
              name={form.name}
              segment={form.segment}
              tagline={form.tagline}
              uf={form.uf}
              verified={form.plan === 'verified' || form.plan === 'premium'}
            />
          </div>
          <div className="reg-aside-block benefits">
            <div className="bnf">
              <Icon name="users" size={20} />
              <div><strong>Alcance qualificado</strong><span>2.400+ compradores do setor de saúde.</span></div>
            </div>
            <div className="bnf">
              <Icon name="shield2" size={20} />
              <div><strong>Selo de verificação</strong><span>Mais confiança e mais respostas.</span></div>
            </div>
            <div className="bnf">
              <Icon name="phone" size={20} />
              <div><strong>Contato direto</strong><span>Receba pedidos de orçamento sem intermediários.</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
