import { statusLabel, typeLabel } from '../data/reference';
import type { RequestStatus, RequestType } from '../data/types';

const STATUS_TONE: Record<RequestStatus, string> = {
  nova: 'new',
  andamento: 'wip',
  respondida: 'ok',
  fechada: 'done',
};

export function StatusPill({ status }: { status: RequestStatus }) {
  return <span className={'st-pill st-' + (STATUS_TONE[status] || 'new')}>{statusLabel(status)}</span>;
}

export function TypePill({ tipo }: { tipo: RequestType }) {
  return <span className={'ty-pill ty-' + tipo}>{typeLabel(tipo)}</span>;
}
