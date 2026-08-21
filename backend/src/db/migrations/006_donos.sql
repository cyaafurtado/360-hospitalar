-- Cada empresa e cada solicitação passam a ter dono. Sem isto, qualquer chamada
-- à API enxerga os dados de todos os fornecedores.

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS usuario_id VARCHAR(60) REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_companies_usuario ON companies (usuario_id);

-- Uma conta administra no máximo uma empresa (índice parcial: as empresas de
-- demonstração seguem sem dono e não disputam a unicidade).
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_usuario_unico
  ON companies (usuario_id) WHERE usuario_id IS NOT NULL;

-- Lado comprador: quem enviou a solicitação.
ALTER TABLE solicitacoes
  ADD COLUMN IF NOT EXISTS solicitante_usuario_id VARCHAR(60) REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_solicitacoes_solicitante_usuario
  ON solicitacoes (solicitante_usuario_id);
