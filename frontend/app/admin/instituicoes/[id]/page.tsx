'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminGetInstituicao, adminAprovarInstituicao, adminRejeitarInstituicao, mensagemDeErro } from '../../../../lib/services';
import { useAsync } from '../../../../lib/useAsync';
import type { TipoInstituicao, InstituicaoStatus } from '../../../../data/types';
import { Icon } from '../../../../lib/icons';
import { Loading, LoadError } from '../../../../components/AsyncState';

const TIPO_LABEL: Record<TipoInstituicao, string> = {
  clinica: 'Clínica',
  hosp_priv: 'Hospital Privado',
  hosp_pub: 'Hospital Público',
  orgao_pub: 'Órgão Público',
};
const CNES_TIPOS: TipoInstituicao[] = ['clinica', 'hosp_priv', 'hosp_pub'];

const STATUS_LABEL: Record<InstituicaoStatus, string> = {
  em_analise: 'Em análise',
  aprovado: 'Verificado',
  rejeitado: 'Não confirmado',
};

type Resposta = '' | 'sim' | 'nao' | 'nao_conforme';
const RESPOSTAS: { id: Resposta; label: string }[] = [
  { id: 'sim', label: 'Sim' },
  { id: 'nao', label: 'Não' },
  { id: 'nao_conforme', label: 'Não conforme' },
];

export default function AdminInstituicaoDetalhePage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();

  const { data: inst, loading, error } = useAsync(
    () => (id ? adminGetInstituicao(id) : Promise.reject(new Error('Instituição não encontrada.'))),
    [id]
  );

  const [cnpjResp, setCnpjResp] = useState<Resposta>('');
  const [cnpjMotivo, setCnpjMotivo] = useState('');
  const [cnesResp, setCnesResp] = useState<Resposta>('');
  const [cnesMotivo, setCnesMotivo] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroAcao, setErroAcao] = useState('');
  const [concluido, setConcluido] = useState<'' | 'aprovado' | 'rejeitado'>('');

  if (loading) {
    return (
      <>
        <button className="back-link" onClick={() => router.push('/admin/instituicoes')}>
          <Icon name="back" size={16} /> Voltar
        </button>
        <Loading label="Carregando instituição…" />
      </>
    );
  }
  if (error || !inst) {
    return (
      <>
        <button className="back-link" onClick={() => router.push('/admin/instituicoes')}>
          <Icon name="back" size={16} /> Voltar
        </button>
        <LoadError message={error ?? 'Instituição não encontrada.'} />
      </>
    );
  }

  const exigeCnes = CNES_TIPOS.includes(inst.tipo);
  const jaRevisada = inst.status !== 'em_analise' || !!concluido;
  const statusAtual = concluido || inst.status;

  const cnpjReprovado = cnpjResp === 'nao' || cnpjResp === 'nao_conforme';
  const cnesReprovado = exigeCnes && (cnesResp === 'nao' || cnesResp === 'nao_conforme');
  const tudoRespondido = cnpjResp !== '' && (!exigeCnes || cnesResp !== '');
  const tudoOk = cnpjResp === 'sim' && (!exigeCnes || cnesResp === 'sim');
  const algumReprovado = cnpjReprovado || cnesReprovado;

  const motivoComposto = [
    cnpjReprovado && `CNPJ ${cnpjResp === 'nao' ? 'não corresponde à instituição' : 'não confere integralmente'}${cnpjMotivo.trim() ? `: ${cnpjMotivo.trim()}` : '.'}`,
    cnesReprovado && `CNES ${cnesResp === 'nao' ? 'não corresponde à instituição' : 'não confere integralmente'}${cnesMotivo.trim() ? `: ${cnesMotivo.trim()}` : '.'}`,
  ].filter(Boolean).join(' ');

  const aprovar = async () => {
    setErroAcao('');
    setEnviando(true);
    try {
      await adminAprovarInstituicao(inst.id);
      setConcluido('aprovado');
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível aprovar a instituição.'));
    } finally {
      setEnviando(false);
    }
  };

  const recusar = async () => {
    setErroAcao('');
    setEnviando(true);
    try {
      await adminRejeitarInstituicao(inst.id, motivoComposto);
      setConcluido('rejeitado');
    } catch (e) {
      setErroAcao(mensagemDeErro(e, 'Não foi possível recusar a instituição.'));
    } finally {
      setEnviando(false);
    }
  };

  const pergunta = (
    label: string,
    valor: string,
    resp: Resposta,
    setResp: (r: Resposta) => void,
    motivo: string,
    setMotivo: (v: string) => void
  ) => (
    <div className="prof-row">
      <span className="prof-label">{label} bate com &ldquo;{valor || '—'}&rdquo;?</span>
      <div className="qprazo">
        {RESPOSTAS.map((r) => (
          <button
            key={r.id}
            type="button"
            className={'reg-pick' + (resp === r.id ? ' on' : '')}
            onClick={() => setResp(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>
      {(resp === 'nao' || resp === 'nao_conforme') && (
        <textarea
          className="prof-input"
          rows={2}
          style={{ marginTop: 8 }}
          placeholder={`O que não confere no ${label}? (aparece para a instituição)`}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
        />
      )}
    </div>
  );

  return (
    <>
      <button className="back-link" onClick={() => router.push('/admin/instituicoes')}>
        <Icon name="back" size={16} /> Voltar à lista
      </button>

      <header className="portal-head">
        <div>
          <h1>{inst.name}</h1>
          <p className="muted">{TIPO_LABEL[inst.tipo]} · {inst.city} · {inst.uf}</p>
        </div>
        <span className={'doc-verif-badge ' + statusAtual}>{STATUS_LABEL[statusAtual]}</span>
      </header>

      {erroAcao && (
        <div className="login-error" style={{ marginBottom: 16 }}>
          <Icon name="close" size={14} stroke={2.4} /> {erroAcao}
        </div>
      )}

      <div className="prof-grid">
        <section className="prof-card">
          <h3>Dados informados</h3>
          <div className="prof-row">
            <span className="prof-label">Razão social</span>
            <span className="prof-value">{inst.razaoSocial || '—'}</span>
          </div>
          <div className="prof-row">
            <span className="prof-label">Nome fantasia</span>
            <span className="prof-value">{inst.nomeFantasia || '—'}</span>
          </div>
          <div className="prof-row">
            <span className="prof-label">Natureza jurídica</span>
            <span className="prof-value">{inst.naturezaJuridica || '—'}</span>
          </div>
          <div className="prof-row">
            <span className="prof-label">CNPJ</span>
            <span className="prof-value">{inst.cnpj || '—'}</span>
          </div>
          {exigeCnes && (
            <div className="prof-row">
              <span className="prof-label">CNES</span>
              <span className="prof-value">{inst.cnes || '—'}</span>
            </div>
          )}
          <div className="prof-row">
            <span className="prof-label">Endereço</span>
            <span className="prof-value">{inst.endereco ? `${inst.endereco}, ` : ''}{inst.city} · {inst.uf}</span>
          </div>
        </section>

        <section className="prof-card">
          <h3>Conta e responsáveis</h3>
          <div className="prof-row">
            <span className="prof-label">Conta (login)</span>
            <span className="prof-value">{inst.donoNome || '—'}</span>
            <span className="prof-value" style={{ fontSize: 13 }}>{inst.donoEmail}</span>
          </div>
          <div className="prof-row">
            <span className="prof-label">Responsável pelo cadastro</span>
            <span className="prof-value">{inst.respCadastro.nome || '—'}</span>
            <span className="prof-value" style={{ fontSize: 13 }}>{inst.respCadastro.email || '—'} {inst.respCadastro.telefone && `· ${inst.respCadastro.telefone}`}</span>
          </div>
          <div className="prof-row">
            <span className="prof-label">Responsável técnico</span>
            <span className="prof-value">{inst.respTecnico.nome || '—'}</span>
            <span className="prof-value" style={{ fontSize: 13 }}>{inst.respTecnico.email || '—'} {inst.respTecnico.telefone && `· ${inst.respTecnico.telefone}`}</span>
          </div>
        </section>

        {jaRevisada ? (
          <section className="prof-card span-2">
            <h3>Revisão</h3>
            {statusAtual === 'aprovado' ? (
              <p>CNPJ{exigeCnes ? ' e CNES' : ''} confirmados. A instituição já vê o selo &ldquo;Verificado&rdquo; no perfil.</p>
            ) : (
              <>
                <p>Marcado como não confirmado. A instituição vê este motivo no próprio perfil:</p>
                <p className="doc-verif-reason" style={{ fontSize: 14 }}>{inst.motivoRejeicao || motivoComposto || '—'}</p>
              </>
            )}
          </section>
        ) : (
          <section className="prof-card span-2">
            <h3>Verificação</h3>
            <p className="prof-card-sub">Confira CNPJ{exigeCnes ? ' e CNES' : ''} nas bases oficiais (Receita Federal{exigeCnes ? ' / CNES do Ministério da Saúde' : ''}) antes de responder.</p>

            {pergunta('CNPJ', inst.cnpj, cnpjResp, setCnpjResp, cnpjMotivo, setCnpjMotivo)}
            {exigeCnes && pergunta('CNES', inst.cnes, cnesResp, setCnesResp, cnesMotivo, setCnesMotivo)}

            <div className="reg-nav" style={{ marginTop: 16 }}>
              {algumReprovado ? (
                <button
                  className="btn-danger"
                  disabled={enviando}
                  onClick={recusar}
                  title={!motivoComposto.includes(':') ? 'Descreva o que não confere, se possível' : undefined}
                >
                  {enviando ? 'Enviando…' : 'Enviar devolutiva (não confirmado)'}
                </button>
              ) : (
                <button className="btn-primary" disabled={!tudoOk || !tudoRespondido || enviando} onClick={aprovar}>
                  <Icon name="check" size={15} stroke={2.6} /> {enviando ? 'Aprovando…' : 'Aprovar cadastro'}
                </button>
              )}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
