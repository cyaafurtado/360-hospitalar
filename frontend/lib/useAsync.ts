import { useEffect, useState } from 'react';

type AsyncState<T> = { data?: T; loading: boolean; error?: string };

// Executa uma função assíncrona; reexecuta quando `deps` muda; ignora respostas obsoletas.
export function useAsync<T>(factory: () => Promise<T>, deps: unknown[]): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ loading: true });

  useEffect(() => {
    let active = true;
    setState({ loading: true });
    factory()
      .then((data) => {
        if (active) setState({ data, loading: false });
      })
      .catch((e: unknown) => {
        if (active) setState({ loading: false, error: e instanceof Error ? e.message : String(e) });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
