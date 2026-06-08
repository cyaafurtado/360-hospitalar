import { Icon } from '../lib/icons';

export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div className="empty">
      <Icon name="signal" size={32} />
      <h3>{label}</h3>
    </div>
  );
}

export function LoadError({ message }: { message?: string }) {
  return (
    <div className="empty">
      <Icon name="close" size={32} />
      <h3>Não foi possível carregar</h3>
      <p>{message || 'Verifique se a API está no ar e tente novamente.'}</p>
    </div>
  );
}
