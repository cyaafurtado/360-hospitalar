'use client';
import { useState } from 'react';
import { SupplierCard } from '../../components/SupplierCard';
import { SupplierProfile } from '../../components/SupplierProfile';
import { SUPPLIERS_DIFERENCIAIS } from '../../data/exemplos-diferenciais';

export default function DiferenciaisDemoPage() {
  const [selectedId, setSelectedId] = useState(SUPPLIERS_DIFERENCIAIS[0].id);
  const selected = SUPPLIERS_DIFERENCIAIS.find((s) => s.id === selectedId) ?? SUPPLIERS_DIFERENCIAIS[0];

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wide text-[#0B6E74]">Demonstração</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Diferenciais do fornecedor
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Elementos visuais que comunicam experiência e confiança nos dois pontos de decisão do
          comprador: o card na listagem e a página de perfil completo. Clique em um card para ver
          o perfil correspondente abaixo.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-600">
          Cards na listagem
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SUPPLIERS_DIFERENCIAIS.map((s) => (
            <SupplierCard key={s.id} supplier={s} onSelect={setSelectedId} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-600">
          Perfil completo — {selected.name}
        </h2>
        <SupplierProfile supplier={selected} />
      </section>
    </div>
  );
}
