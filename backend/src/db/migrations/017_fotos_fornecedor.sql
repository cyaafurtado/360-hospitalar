-- Fotos da empresa (fachada, instalações etc.), públicas no site — ao
-- contrário dos documentos de verificação, aqui não existe aprovação: o
-- fornecedor sobe a foto e ela já aparece pra quem visita o perfil.
-- Mesma ideia de guardar o arquivo como bytea direto no Postgres, sem
-- serviço de storage externo.
CREATE TABLE IF NOT EXISTS fotos_fornecedor (
  id            VARCHAR(60)  PRIMARY KEY,
  company_id    VARCHAR(60)  NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  nome          VARCHAR(255) NOT NULL,
  tipo_mime     VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
  tamanho_bytes INTEGER      NOT NULL,
  conteudo      BYTEA        NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fotos_fornecedor_company ON fotos_fornecedor (company_id);
