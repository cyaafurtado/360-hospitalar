import type { SolicitacaoRequest } from '../data/types';
import { typeLabel, statusLabel } from '../data/reference';

// Cores da marca (RGB)
const PRIMARY: [number, number, number] = [34, 89, 193];
const ACCENT: [number, number, number] = [56, 168, 130];
const DARK: [number, number, number] = [22, 31, 52];
const MUTED: [number, number, number] = [100, 112, 136];
const BORDER: [number, number, number] = [218, 224, 235];
const BG: [number, number, number] = [246, 248, 252];

function hoje(): string {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export async function gerarPdfSolicitacao(req: SolicitacaoRequest): Promise<void> {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = 0;

  // ── Cabeçalho azul ──────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, W, 38, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('360 Hospitalar', margin, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(180, 205, 255);
  doc.text('REDE DE PRESTADORES', margin, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(`Solicitação — ${typeLabel(req.tipo)}`, margin, 33);

  // ID e data no canto direito
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 205, 255);
  doc.text(req.id, W - margin, 16, { align: 'right' });
  doc.text(`Gerado em ${hoje()}`, W - margin, 22, { align: 'right' });

  y = 48;

  // ── Status badge ─────────────────────────────────────────────────
  const statusStr = statusLabel(req.status);
  const badgeColor = req.status === 'respondida' ? ACCENT
    : req.status === 'nova' ? [220, 160, 40] as [number,number,number]
    : req.status === 'fechada' ? [70, 80, 100] as [number,number,number]
    : PRIMARY;

  doc.setFillColor(...badgeColor);
  doc.roundedRect(margin, y, 36, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(statusStr.toUpperCase(), margin + 18, y + 4.8, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(`Recebida: ${req.quando}`, margin + 42, y + 4.8);

  y += 14;

  // ── Seção: Solicitante ───────────────────────────────────────────
  const sectionTitle = (title: string) => {
    doc.setFillColor(...BG);
    doc.rect(margin, y, W - margin * 2, 7, 'F');
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(margin, y, W - margin, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(...PRIMARY);
    doc.text(title.toUpperCase(), margin + 3, y + 4.8);
    y += 10;
  };

  const field = (label: string, value: string, x: number, col: number) => {
    const colW = (W - margin * 2) / col;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(value || '—', x, y + 5);
    return colW;
  };

  sectionTitle('Solicitante');

  const col2 = (W - margin * 2) / 2;
  field('Nome', req.solicitante, margin, 2);
  field('Cargo', req.cargo || '—', margin + col2, 2);
  y += 12;
  field('Organização', req.organizacao, margin, 2);
  field('Localização', `${req.cidade} — ${req.uf}`, margin + col2, 2);
  y += 12;
  field('E-mail', req.email, margin, 2);
  field('Telefone', req.phone, margin + col2, 2);
  y += 16;

  // ── Seção: Detalhes da solicitação ──────────────────────────────
  sectionTitle('Detalhes da Solicitação');

  if (req.servico) {
    field('Serviço solicitado', req.servico, margin, 2);
    field('Prazo desejado', req.prazo || '—', margin + col2, 2);
    y += 12;
  }

  field('Prestador de referência', req.prestador, margin, 1);
  y += 12;

  // Descrição / resumo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.text('Descrição', margin, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK);
  const lines = doc.splitTextToSize(req.resumo || '—', W - margin * 2);
  doc.text(lines, margin, y);
  y += lines.length * 5 + 10;

  // ── Seção: Aprovação e Vigência (apenas fechadas) ────────────────
  if (req.status === 'fechada' && req.contrato) {
    const c = req.contrato;

    // Faixa verde esmeralda
    doc.setFillColor(...ACCENT);
    doc.rect(margin, y, W - margin * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('APROVAÇÃO E VIGÊNCIA DO CONTRATO', margin + 3, y + 4.8);

    // Selo "Contrato Fechado" à direita
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('CONTRATO FECHADO', W - margin - 3, y + 4.8, { align: 'right' });
    y += 10;

    // Linha 1: aprovação + número
    field('Data de aprovação', c.aprovadoEm || req.quando, margin, 2);
    field('Número do contrato', c.numero || '—', margin + col2, 2);
    y += 12;

    // Linha 2: início + validade
    field('Início da vigência', c.inicio || '—', margin, 2);
    field('Validade / Encerramento', c.validade || '—', margin + col2, 2);
    y += 12;

    // Linha 3: valor + assinatura
    field('Valor contratado', c.valor || '—', margin, 2);
    field('Contrato assinado', c.assinado ? 'Sim — documento arquivado' : 'Pendente de assinatura', margin + col2, 2);
    y += 16;

    // Linha separadora verde
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.6);
    doc.line(margin, y - 6, W - margin, y - 6);
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
  }

  // ── Tabela de contato ────────────────────────────────────────────
  const tableBody: string[][] = [
    ['Tipo de solicitação', typeLabel(req.tipo)],
    ['Status atual', statusLabel(req.status)],
    ['E-mail de contato', req.email],
    ['Telefone', req.phone],
    ['ID da solicitação', req.id],
  ];

  if (req.status === 'fechada' && req.contrato) {
    if (req.contrato.numero) tableBody.push(['Nº do contrato', req.contrato.numero]);
    if (req.contrato.valor) tableBody.push(['Valor contratado', req.contrato.valor]);
    if (req.contrato.aprovadoEm || req.quando) tableBody.push(['Aprovado em', req.contrato.aprovadoEm || req.quando]);
    if (req.contrato.inicio) tableBody.push(['Início da vigência', req.contrato.inicio]);
    if (req.contrato.validade) tableBody.push(['Validade', req.contrato.validade]);
  }

  autoTable(doc, {
    startY: y,
    head: [['Campo', 'Valor']],
    body: tableBody,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9, cellPadding: 4, textColor: DARK },
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
    alternateRowStyles: { fillColor: BG },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: MUTED, cellWidth: 60 },
    },
    tableLineColor: BORDER,
    tableLineWidth: 0.3,
  });

  // ── Rodapé ───────────────────────────────────────────────────────
  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pH = doc.internal.pageSize.getHeight();
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(margin, pH - 14, W - margin, pH - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.text('360 Hospitalar · Rede de Prestadores · 360-hospitalar.verificadoagora.com.br', margin, pH - 8);
    doc.text(`Página ${i} de ${pageCount}`, W - margin, pH - 8, { align: 'right' });
  }

  doc.save(`360H_${req.id}.pdf`);
}
