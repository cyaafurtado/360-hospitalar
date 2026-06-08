// Copia os arquivos .sql de src/db/migrations para dist/db/migrations.
// Cross-platform e à prova de cache: limpa o destino antes.
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'src', 'db', 'migrations');
const dest = path.join(__dirname, '..', 'dist', 'db', 'migrations');

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });

let n = 0;
for (const file of fs.readdirSync(src)) {
  if (file.endsWith('.sql')) {
    fs.copyFileSync(path.join(src, file), path.join(dest, file));
    n++;
  }
}
console.log(`[build] ${n} migrations copiadas para dist/db/migrations`);
