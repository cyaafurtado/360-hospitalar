import { Icon } from '../lib/icons';

export function VerifiedTag({ small }: { small?: boolean }) {
  return (
    <span className={'verified' + (small ? ' sm' : '')}>
      <Icon name="check" size={small ? 11 : 13} stroke={2.4} />
      Verificada
    </span>
  );
}
