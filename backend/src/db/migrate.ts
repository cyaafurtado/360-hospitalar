import fs from 'fs';
import path from 'path';
import pool from './connection';
import '../config/env';

async function runMigrations() {
  // Lê os .sql do src (sempre reflete o commit) com fallback para dist/db/migrations.
  const candidatos = [
    path.join(__dirname, '..', '..', 'src', 'db', 'migrations'), // dist/db -> src/db/migrations
    path.join(__dirname, 'migrations'), // fallback: dist/db/migrations
  ];
  const migrationsDir = candidatos.find((d) => fs.existsSync(d)) ?? candidatos[1];
  console.log(`[migrate] lendo migrations de: ${migrationsDir}`);
  const files = fs.readdirSync(migrationsDir).sort();

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        run_at TIMESTAMP DEFAULT NOW()
      )
    `);

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;

      const { rows } = await client.query(
        'SELECT id FROM migrations WHERE filename = $1',
        [file]
      );
      if (rows.length > 0) {
        console.log(`  [skip] ${file}`);
        continue;
      }

      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`  [run]  ${file}`);
      await client.query(sql);
      await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
      console.log(`  [ok]   ${file}`);
    }

    console.log('\nMigrations concluídas!');
  } catch (err) {
    console.error('Erro nas migrations:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error('Migrations falharam:', err);
  process.exit(1);
});
