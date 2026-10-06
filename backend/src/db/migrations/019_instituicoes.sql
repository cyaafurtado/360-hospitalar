-- Cadastro da instituição de saúde (clínica, hospital privado/público, órgão
-- público) — até aqui só existia no formulário do assistente, sem nenhuma
-- tabela pra guardar o resultado. Diferente de companies (fornecedor), o
-- assistente só grava tudo de uma vez no fim: não existe pré-cadastro em
-- duas etapas aqui — por isso basta a linha existir pra saber que o
-- cadastro foi finalizado (sem coluna de status).
CREATE TABLE IF NOT EXISTS instituicoes (
  id          VARCHAR(60)  PRIMARY KEY,
  usuario_id  VARCHAR(60)  NOT NULL UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo        VARCHAR(20)  NOT NULL,
  name        VARCHAR(200) NOT NULL DEFAULT '',
  cnpj        VARCHAR(20)  NOT NULL DEFAULT '',
  cnes        VARCHAR(20)  NOT NULL DEFAULT '',
  uf          VARCHAR(2)   NOT NULL DEFAULT '',
  city        VARCHAR(120) NOT NULL DEFAULT '',
  about       TEXT         NOT NULL DEFAULT '',
  email       VARCHAR(160) NOT NULL DEFAULT '',
  phone       VARCHAR(40)  NOT NULL DEFAULT '',
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

ALTER TABLE instituicoes
  DROP CONSTRAINT IF EXISTS instituicoes_tipo_check;
ALTER TABLE instituicoes
  ADD CONSTRAINT instituicoes_tipo_check CHECK (tipo IN ('clinica', 'hosp_priv', 'hosp_pub', 'orgao_pub'));
