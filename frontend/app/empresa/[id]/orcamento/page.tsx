'use client';
import { useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCompanies, createQuote } from '../../../../lib/services';
import { useAsync } from '../../../../lib/useAsync';
import { segmentLabel, STATES, typeLabel } from '../../../../data/reference';
import { maskPhone } from '../../../../lib/masks';
import { Icon } from '../../../../lib/icons';
import { Logo } from '../../../../components/Logo';
import { RatingLine } from '../../../../components/Stars';
import { VerifiedTag } from '../../../../components/VerifiedTag';
import { Field } from '../../../../components/Field';
import { Loading, LoadError } from '../../../../components/AsyncState';

const Q_TYPES = [
  { id: 'cotacao', label: 'Cotação de preço', icon: 'file' },
  { id: 'contato', label: 'Falar com consultor', icon: 'phone' },
  { id: 'parceria', label: 'Proposta de parceria', icon: 'users' },
];
const Q_PRAZOS = ['Imediato', 'Até 15 dias', 'Até 30 dias', 'Sem urgência'];

export default function OrcamentoPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const { data: companies, loading, error } = useAsync(() => getCompanies(), []);
  const c = companies?.find((x) => x.id === id);

  const [tipo, setTipo] = useState('cotacao');
  const [prazo, setPrazo] = useState('Até 30 dias');
  const [done, setDone] = useState(false);
  const [proto, setProto] = useState('');
  const [sending, setSending] = useState(false);
  const [f, setF] = useState({
    nome: '',
    organizacao: '',
    cargo: '',
    email: '',
    telefone: '',
    uf: '',
    cidade: '',
    servico: '',
    detalhes: '',
  });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  if (loading || error) {
    return (
      <div className="screen register">
        {loading ? <Loading /> : <LoadError message={error} />}
      </div>
    );
  }
  if (!c) {
    return (
      <div className="screen register">
        <div className="empty">
          <Icon name="search" size={34} />
          <h3>Fornecedor não encontrado</h3>
          <button className="btn-primary" onClick={() => router.push('/buscar')}>
            Ver fornecedores
          </button>
        </div>
      </div>
    );
  }

  // defaults dependentes do fornecedor
  const ufVal = f.uf || c.uf;
  const servicoVal = f.servico || c.services[0] || '';

  const valid =
    f.nome.trim() &&
    f.organizacao.trim() &&
    /\S+@\S+\.\S+/.test(f.email) &&
    f.telefone.replace(/\D/g, '').length >= 10 &&
    f.detalhes.trim().length >= 8;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!valid || sending) return;
    setSending(true);
    try {
      const r = await createQuote({
        prestadorId: c.id,
        prestador: c.name,
        tipo,
        nome: f.nome,
        cargo: f.cargo,
        organizacao: f.organizacao,
        email: f.email,
        telefone: f.telefone,
        uf: ufVal,
        cidade: f.cidade,
        servico: servicoVal,
        detalhes: f.detalhes,
      });
      setProto(r.id || 'SOL-' + Math.floor(2050 + Math.random() * 900));
    } catch {
      setProto('SOL-' + Math.floor(2050 + Math.random() * 900));
    } finally {
      setSending(false);
      setDone(true);
      window.scrollTo({ top: 0 });
    }
  };

  if (done) {
    return (
      <div className="screen register">
        <div className="reg-success">
          <div className="success-mark">
            <Icon name="check" size={34} stroke={2.6} />
          </div>
          <h1>Solicitação enviada!</h1>
          <p>
            Seu pedido de <strong>{typeLabel(tipo)}</strong> foi encaminhado para{' '}
            <strong>{c.name}</strong> sob o protocolo <strong>{proto}</strong>. O fornecedor responde
            diretamente em <strong>{f.email}</strong> — normalmente em até 2 dias úteis.
          </p>
          <div className="quote-recap">
            <div className="qr-row">
              <span>Fornecedor</span>
              <strong>{c.name}</strong>
            </div>
            <div className="qr-row">
              <span>Tipo</span>
              <strong>{typeLabel(tipo)}</strong>
            </div>
            <div className="qr-row">
              <span>Serviço</span>
              <strong>{servicoVal}</strong>
            </div>
            <div className="qr-row">
              <span>Prazo desejado</span>
              <strong>{prazo}</strong>
            </div>
          </div>
          <div className="success-actions">
            <button className="btn-primary" onClick={() => router.push(`/empresa/${c.id}`)}>
              Voltar ao fornecedor
            </button>
            <button className="btn-ghost" onClick={() => router.push('/buscar')}>
              Ver outros fornecedores
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen register">
      <button className="back-link" onClick={() => router.push(`/empresa/${c.id}`)}>
        <Icon name="back" size={16} /> Voltar ao fornecedor
      </button>

      <header className="reg-hero">
        <div className="hero-eyebrow">Solicitar orçamento</div>
        <h1>
          Peça um orçamento a <em>{c.name}</em>
        </h1>
        <p>
          Conte o que sua organização precisa. O fornecedor recebe a solicitação e responde
          diretamente para você, sem intermediários.
        </p>
      </header>

      <div className="reg-body quote-body">
        <form className="reg-form-col" onSubmit={submit}>
          <div className="reg-card">
            <h3 className="reg-section-title">
              <Icon name="file" size={16} /> Tipo de solicitação
            </h3>
            <div className="qtype-grid">
              {Q_TYPES.map((t) => (
                <button type="button" key={t.id} className={'qtype' + (tipo === t.id ? ' on' : '')} onClick={() => setTipo(t.id)}>
                  <Icon name={t.icon} size={18} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            <h3 className="reg-section-title mt">
              <Icon name="users" size={16} /> Seus dados
            </h3>
            <div className="reg-grid">
              <div className="reg-row2">
                <Field label="Nome completo" required>
                  <input value={f.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Seu nome" />
                </Field>
                <Field label="Cargo">
                  <input value={f.cargo} onChange={(e) => set('cargo', e.target.value)} placeholder="Ex: Coordenador de Compras" />
                </Field>
              </div>
              <Field label="Organização" required>
                <input value={f.organizacao} onChange={(e) => set('organizacao', e.target.value)} placeholder="Hospital, clínica ou empresa" />
              </Field>
              <div className="reg-row2">
                <Field label="E-mail" required>
                  <input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="voce@organizacao.com.br" />
                </Field>
                <Field label="Telefone" required>
                  <input value={f.telefone} onChange={(e) => set('telefone', maskPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="numeric" />
                </Field>
              </div>
              <div className="reg-row2">
                <Field label="Estado">
                  <div className="reg-select">
                    <Icon name="pin" size={16} />
                    <select value={ufVal} onChange={(e) => set('uf', e.target.value)}>
                      {STATES.map((s) => (
                        <option key={s.uf} value={s.uf}>
                          {s.name} ({s.uf})
                        </option>
                      ))}
                    </select>
                  </div>
                </Field>
                <Field label="Cidade">
                  <input value={f.cidade} onChange={(e) => set('cidade', e.target.value)} placeholder="Sua cidade" />
                </Field>
              </div>
            </div>

            <h3 className="reg-section-title mt">
              <Icon name="list" size={16} /> Sobre o que você precisa
            </h3>
            <div className="reg-grid">
              <div className="reg-row2">
                <Field label="Serviço de interesse">
                  <div className="reg-select">
                    <Icon name="check" size={16} />
                    <select value={servicoVal} onChange={(e) => set('servico', e.target.value)}>
                      {c.services.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                      <option value="Outro">Outro / não listado</option>
                    </select>
                  </div>
                </Field>
                <Field label="Prazo desejado">
                  <div className="qprazo">
                    {Q_PRAZOS.map((p) => (
                      <button type="button" key={p} className={'reg-pick' + (prazo === p ? ' on' : '')} onClick={() => setPrazo(p)}>
                        {p}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
              <Field
                label="Detalhes da solicitação"
                required
                hint="Quantidades, contexto, requisitos técnicos — quanto mais claro, melhor o orçamento."
              >
                <textarea
                  rows={5}
                  value={f.detalhes}
                  onChange={(e) => set('detalhes', e.target.value)}
                  placeholder="Ex: Precisamos de apoio laboratorial 24h para uma nova unidade com volume estimado de 12 mil exames/mês…"
                />
              </Field>
            </div>

            <div className="reg-nav">
              <button type="button" className="btn-ghost" onClick={() => router.push(`/empresa/${c.id}`)}>
                <Icon name="back" size={15} /> Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={!valid || sending}>
                {sending ? 'Enviando…' : <>Enviar solicitação <Icon name="arrow" size={15} /></>}
              </button>
            </div>
          </div>
        </form>

        <aside className="reg-aside">
          <div className="reg-aside-block">
            <span className="reg-aside-title">Fornecedor selecionado</span>
            <div className="quote-supplier">
              <Logo name={c.name} size={48} />
              <div>
                <div className="qs-name">
                  {c.name}
                  {c.verified && <VerifiedTag small />}
                </div>
                <div className="qs-seg">{segmentLabel(c.segment)}</div>
                <div className="qs-meta">
                  <Icon name="pin" size={13} /> {c.city} · {c.uf}
                </div>
              </div>
            </div>
            <div className="quote-rate">
              <RatingLine rating={c.rating} reviews={c.reviews} />
            </div>
          </div>
          <div className="reg-aside-block benefits">
            <div className="bnf">
              <Icon name="shield2" size={20} />
              <div>
                <strong>Sem custo e sem compromisso</strong>
                <span>Solicitar orçamento é gratuito.</span>
              </div>
            </div>
            <div className="bnf">
              <Icon name="phone" size={20} />
              <div>
                <strong>Resposta direta</strong>
                <span>O fornecedor fala com você sem intermediários.</span>
              </div>
            </div>
            <div className="bnf">
              <Icon name="check" size={20} />
              <div>
                <strong>Fornecedor verificado</strong>
                <span>Documentos e certificações auditados.</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
