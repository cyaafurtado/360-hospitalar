-- Documentação de verificação (certificações, licenças) do fornecedor.
-- Nunca existiu no banco: a tela "Meu perfil" só guardava isso no estado do
-- navegador, e o próprio arquivo nunca saía do navegador — ao salvar, a
-- resposta da API (que não conhecia nada disso) sobrescrevia o formulário e
-- o documento desaparecia, como se nunca tivesse sido adicionado.
-- PDF/imagem fica salvo como bytea direto no Postgres (sem serviço de
-- storage externo pra configurar); limite de tamanho é aplicado na API.
CREATE TABLE IF NOT EXISTS documentos_fornecedor (
  id          VARCHAR(60)  PRIMARY KEY,
  company_id  VARCHAR(60)  NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tipo        VARCHAR(120) NOT NULL DEFAULT '',
  numero      VARCHAR(120) NOT NULL DEFAULT '',
  validade    DATE,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documentos_fornecedor_company ON documentos_fornecedor (company_id);

CREATE TABLE IF NOT EXISTS documento_arquivos (
  id            VARCHAR(60)  PRIMARY KEY,
  documento_id  VARCHAR(60)  NOT NULL REFERENCES documentos_fornecedor(id) ON DELETE CASCADE,
  nome          VARCHAR(255) NOT NULL,
  tipo_mime     VARCHAR(100) NOT NULL DEFAULT 'application/octet-stream',
  tamanho_bytes INTEGER      NOT NULL,
  conteudo      BYTEA        NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documento_arquivos_documento ON documento_arquivos (documento_id);
