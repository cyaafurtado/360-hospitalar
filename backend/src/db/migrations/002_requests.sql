-- Solicitações (cotação/contato/parceria) recebidas pelos fornecedores (Parte A)
CREATE TABLE IF NOT EXISTS solicitacoes (
  id           VARCHAR(20) PRIMARY KEY,
  solicitante  VARCHAR(160) NOT NULL,
  cargo        VARCHAR(160) NOT NULL DEFAULT '',
  organizacao  VARCHAR(200) NOT NULL,
  tipo         VARCHAR(20)  NOT NULL,  -- cotacao | contato | parceria
  status       VARCHAR(20)  NOT NULL DEFAULT 'nova', -- nova | andamento | respondida | fechada
  prestador    VARCHAR(255) NOT NULL,
  prestador_id VARCHAR(60),
  uf           VARCHAR(2)   NOT NULL DEFAULT '',
  cidade       VARCHAR(120) NOT NULL DEFAULT '',
  email        VARCHAR(160) NOT NULL DEFAULT '',
  phone        VARCHAR(40)  NOT NULL DEFAULT '',
  quando       VARCHAR(40)  NOT NULL DEFAULT '',
  resumo       TEXT         NOT NULL DEFAULT '',
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_prestador ON solicitacoes(prestador_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status ON solicitacoes(status);
