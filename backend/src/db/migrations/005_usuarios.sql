-- Usuários, sessões e vínculo com a empresa (auth real — substitui o login mock)

CREATE TABLE IF NOT EXISTS usuarios (
  id           VARCHAR(60)  PRIMARY KEY,
  nome         VARCHAR(160) NOT NULL DEFAULT '',
  email        VARCHAR(160) NOT NULL,
  senha_hash   VARCHAR(255) NOT NULL,
  tipo         VARCHAR(20)  NOT NULL DEFAULT 'fornecedor', -- fornecedor | contratante
  company_id   VARCHAR(60),
  organizacao  VARCHAR(200) NOT NULL DEFAULT '',
  telefone     VARCHAR(40)  NOT NULL DEFAULT '',
  ativo        BOOLEAN      NOT NULL DEFAULT TRUE,
  ultimo_login TIMESTAMP,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- E-mail é único sem diferenciar maiúsculas (índice funcional)
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_usuarios_company ON usuarios (company_id);

-- Refresh tokens: guardamos só o hash SHA-256, nunca o token em claro
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          VARCHAR(60)  PRIMARY KEY,
  usuario_id  VARCHAR(60)  NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  token_hash  VARCHAR(64)  NOT NULL,
  expira_em   TIMESTAMP    NOT NULL,
  revogado_em TIMESTAMP,
  motivo      VARCHAR(20),  -- rotacao | logout | seguranca
  user_agent  VARCHAR(255) NOT NULL DEFAULT '',
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_refresh_hash ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_usuario ON refresh_tokens (usuario_id);
