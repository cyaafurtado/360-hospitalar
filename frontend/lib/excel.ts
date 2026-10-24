import type { SolicitacaoRequest } from '../data/types';
import { typeLabel, statusLabel } from '../data/reference';

// CSV com BOM: abre direto no Excel, com acentuação correta, sem precisar de
// nenhuma biblioteca de planilha no bundle (as disponíveis pra gerar .xlsx no
// navegador estão sem manutenção de segurança ou são pesadas demais pra isso).
function csvEscape(v: string): string {
  const s = v ?? '';
  return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function baixarCsv(nomeArquivo: string, linhas: [string, string][]): void {
  const corpo = linhas.map(([campo, valor]) => `${csvEscape(campo)},${csvEscape(valor)}`).join('\r\n');
  const csv = '﻿' + 'Campo,Valor\r\n' + corpo;

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function gerarExcelSolicitacao(req: SolicitacaoRequest): void {
  const linhas: [string, string][] = [
    ['ID da solicitação', req.id],
    ['Tipo', typeLabel(req.tipo)],
    ['Status', statusLabel(req.status)],
    ['Solicitante', req.solicitante],
    ['Cargo', req.cargo || '—'],
    ['Organização', req.organizacao],
    ['Cidade', req.cidade],
    ['Estado', req.uf],
    ['E-mail', req.email],
    ['Telefone', req.phone],
    ['Prestador de referência', req.prestador],
    ['Serviço solicitado', req.servico || '—'],
    ['Prazo desejado', req.prazo || '—'],
    ['Data', req.quando],
    ['Descrição', req.resumo || '—'],
  ];

  if (req.status === 'fechada' && req.contrato) {
    const c = req.contrato;
    linhas.push(
      ['Nº do contrato', c.numero || '—'],
      ['Valor contratado', c.valor || '—'],
      ['Aprovado em', c.aprovadoEm || req.quando],
      ['Início da vigência', c.inicio || '—'],
      ['Validade / Encerramento', c.validade || '—'],
      ['Contrato assinado', c.assinado ? 'Sim' : 'Pendente de assinatura']
    );
  }

  baixarCsv(`360H_${req.id}.csv`, linhas);
}
