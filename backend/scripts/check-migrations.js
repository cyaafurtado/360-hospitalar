// Falha se duas migrations novas dividirem o mesmo prefixo numérico.
// O par 008_* já rodou em produção com esses nomes: renomear faria o migrate.ts
// reaplicar 008_limpa_base_demo.sql e apagar dados, então ele fica como exceção.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'db', 'migrations');
const PREFIXOS_HISTORICOS = new Set(['008']);

const arquivos = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const porPrefixo = new Map();
const erros = [];

for (const f of arquivos) {
  const m = /^(\d{3})_[a-z0-9_]+\.sql$/.exec(f);
  if (!m) {
    erros.push(`nome fora do padrão NNN_nome.sql: ${f}`);
    continue;
  }
  const lista = porPrefixo.get(m[1]) || [];
  lista.push(f);
  porPrefixo.set(m[1], lista);
}

for (const [prefixo, lista] of porPrefixo) {
  if (lista.length > 1 && !PREFIXOS_HISTORICOS.has(prefixo)) {
    erros.push(`prefixo ${prefixo} repetido: ${lista.join(', ')}`);
  }
}

if (erros.length) {
  console.error('[check-migrations] ' + erros.join('\n[check-migrations] '));
  process.exit(1);
}
console.log(`[check-migrations] ok — ${arquivos.length} migrations, sem prefixo repetido`);
