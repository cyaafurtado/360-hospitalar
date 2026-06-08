-- Fornecedores do diretório (Parte A)
CREATE TABLE IF NOT EXISTS companies (
  id          VARCHAR(60) PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  segment     VARCHAR(40)  NOT NULL,
  tagline     TEXT         NOT NULL DEFAULT '',
  city        VARCHAR(120) NOT NULL DEFAULT '',
  uf          VARCHAR(2)   NOT NULL DEFAULT '',
  rating      REAL         NOT NULL DEFAULT 0,
  reviews     INTEGER      NOT NULL DEFAULT 0,
  verified    BOOLEAN      NOT NULL DEFAULT FALSE,
  founded     INTEGER      NOT NULL DEFAULT 0,
  employees   VARCHAR(40)  NOT NULL DEFAULT '',
  services    TEXT[]       NOT NULL DEFAULT '{}',
  badges      TEXT[]       NOT NULL DEFAULT '{}',
  about       TEXT         NOT NULL DEFAULT '',
  phone       VARCHAR(40)  NOT NULL DEFAULT '',
  site        VARCHAR(160) NOT NULL DEFAULT '',
  email       VARCHAR(160),
  atende_ufs  TEXT[]       NOT NULL DEFAULT '{}',
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_segment ON companies(segment);
CREATE INDEX IF NOT EXISTS idx_companies_uf ON companies(uf);
CREATE INDEX IF NOT EXISTS idx_companies_rating ON companies(rating DESC);
